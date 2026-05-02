import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Crown, User, Users } from "lucide-react";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: string;
}

function MemberAvatar({ name, role }: { name: string; role: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const isOwner = role === "owner";
  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
        isOwner
          ? "bg-primary/10 text-primary"
          : "bg-secondary text-muted-foreground"
      }`}
    >
      {initials}
    </div>
  );
}

export default function Team() {
  const { user } = useAuth();
  const { data: members, isLoading } = useQuery<TeamMember[]>({ queryKey: ["/api/team"] });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const inviteMutation = useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) =>
      apiRequest("POST", "/api/auth/invite", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      setIsDialogOpen(false);
      toast({ title: "Staff member added", description: "They can now log in with their credentials." });
    },
    onError: (err: any) => {
      const msg = err.message || "";
      if (msg.includes("409")) {
        toast({ title: "Email already registered", variant: "destructive" });
      } else {
        toast({ title: "Failed to invite", variant: "destructive" });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    inviteMutation.mutate({
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      password: fd.get("password") as string,
    });
  };

  const isOwner = user?.role === "owner";

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          {members && members.length > 0 && (
            <p className="text-sm text-muted-foreground">{members.length} team {members.length === 1 ? "member" : "members"}</p>
          )}
        </div>
        {isOwner && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5" data-testid="button-invite-staff">
                <Plus className="w-4 h-4" />
                Invite Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Invite Staff Member</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground -mt-1">
                Staff can view properties and manage maintenance tasks assigned to them.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" placeholder="e.g. Carlos M." required data-testid="input-staff-name" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="staff@email.com" required data-testid="input-staff-email" />
                </div>
                <div>
                  <Label htmlFor="password">Temporary Password</Label>
                  <Input id="password" name="password" type="password" minLength={6} required data-testid="input-staff-password" />
                  <p className="text-[11px] text-muted-foreground mt-1">They can change this after first login.</p>
                </div>
                <Button type="submit" className="w-full" disabled={inviteMutation.isPending} data-testid="button-submit-invite">
                  Add Staff Member
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : members && members.length <= 1 ? (
        /* ── Empty / Solo State ── */
        <div className="flex flex-col items-center text-center py-16 px-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-primary/40" />
          </div>
          <h3 className="text-base font-semibold mb-1.5">
            {members?.length === 1 ? "You're the only member" : "No team members"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-5 leading-relaxed">
            Invite cleaners, maintenance workers, or co-hosts to help manage your properties. Staff see only what they need.
          </p>
          {isOwner && (
            <Button onClick={() => setIsDialogOpen(true)} className="gap-1.5">
              <Plus className="w-4 h-4" />
              Invite Your First Staff Member
            </Button>
          )}
        </div>
      ) : (
        /* ── Team List ── */
        <div className="space-y-2">
          {members?.map((m) => (
            <Card key={m.id} className="border border-card-border" data-testid={`team-member-${m.id}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <MemberAvatar name={m.name} role={m.role} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{m.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                </div>
                <Badge
                  variant={m.role === "owner" ? "default" : "secondary"}
                  className="shrink-0 text-[10px] capitalize gap-1"
                >
                  {m.role === "owner" && <Crown className="w-3 h-3" />}
                  {m.role}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
