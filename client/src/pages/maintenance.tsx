import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Wrench, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { MaintenanceRequest, Property } from "@shared/schema";

const statusFilters = ["all", "open", "in-progress", "resolved"] as const;

export default function Maintenance() {
  const { data: maintenance, isLoading } = useQuery<MaintenanceRequest[]>({
    queryKey: ["/api/maintenance"],
  });
  const { data: properties } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/maintenance", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setIsDialogOpen(false);
      toast({ title: "Issue reported" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest("PATCH", `/api/maintenance/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Status updated" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      propertyId: fd.get("propertyId") as string,
      title: fd.get("title") as string,
      description: fd.get("description") as string,
      priority: fd.get("priority") as string,
      assignedTo: (fd.get("assignedTo") as string) || null,
      status: "open",
    });
  };

  const getPropertyName = (id: string) =>
    properties?.find((p) => p.id === id)?.name || "\u2014";

  const filtered = maintenance?.filter((m) => {
    if (filter === "all") return true;
    return m.status === filter;
  });

  const statusIcon = (status: string) => {
    switch (status) {
      case "open": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "in-progress": return <Clock className="w-4 h-4 text-blue-500" />;
      case "resolved": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default: return <Wrench className="w-4 h-4" />;
    }
  };

  const priorityVariant = (priority: string): any => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "secondary";
    }
  };

  const getFilterCount = (s: string) =>
    s === "all" ? (maintenance?.length ?? 0) : (maintenance?.filter((m) => m.status === s).length ?? 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Filter tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {statusFilters.map((s) => (
            <Button
              key={s}
              variant={filter === s ? "default" : "secondary"}
              size="sm"
              onClick={() => setFilter(s)}
              className="text-xs capitalize gap-1.5"
              data-testid={`filter-${s}`}
            >
              {s === "all" ? "All" : s.replace("-", " ")}
              <span className={`text-[10px] tabular-nums ${filter === s ? "opacity-70" : "text-muted-foreground"}`}>
                {getFilterCount(s)}
              </span>
            </Button>
          ))}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5" data-testid="button-add-maintenance">
              <Plus className="w-4 h-4" />
              Report Issue
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Report Maintenance Issue</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <Label>Property</Label>
                <Select name="propertyId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Issue Title</Label>
                <Input id="title" name="title" placeholder="e.g. Leaky faucet in bathroom" required data-testid="input-maintenance-title" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} placeholder="Describe the issue in detail..." required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Priority</Label>
                  <Select name="priority" defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="assignedTo">Assign To</Label>
                  <Input id="assignedTo" name="assignedTo" placeholder="Staff name" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-maintenance">
                Submit Issue
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : !maintenance || maintenance.length === 0 ? (
        /* ── Empty State ── */
        <div className="flex flex-col items-center text-center py-16 px-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/8 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500/40" />
          </div>
          <h3 className="text-base font-semibold mb-1.5">All clear</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-5 leading-relaxed">
            No maintenance issues reported. When something needs fixing, you can log and track it here.
          </p>
        </div>
      ) : filtered?.length === 0 ? (
        <div className="flex flex-col items-center text-center py-12 px-4">
          <p className="text-sm text-muted-foreground">No issues match this filter.</p>
        </div>
      ) : (
        /* ── Issue Cards ── */
        <div className="space-y-3">
          {filtered?.map((m) => (
            <Card key={m.id} className="border border-card-border" data-testid={`maintenance-card-${m.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="mt-0.5 shrink-0">{statusIcon(m.status)}</div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold">{m.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {getPropertyName(m.propertyId)} · {m.assignedTo || "Unassigned"}
                      </p>
                      {m.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{m.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={priorityVariant(m.priority)} className="text-[10px]">
                      {m.priority}
                    </Badge>
                    {m.status !== "resolved" && (
                      <Select
                        value={m.status}
                        onValueChange={(val) =>
                          updateMutation.mutate({
                            id: m.id,
                            data: {
                              status: val,
                              resolvedAt: val === "resolved" ? new Date().toISOString() : null,
                            },
                          })
                        }
                      >
                        <SelectTrigger className="w-28 h-7 text-[11px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    {m.status === "resolved" && (
                      <Badge variant="secondary" className="text-[10px] bg-emerald-500/8 text-emerald-600 dark:text-emerald-400">
                        Resolved
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
