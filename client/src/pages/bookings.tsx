import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Copy, ExternalLink, ShieldCheck, ShieldAlert, CalendarCheck, Building2, Link2 } from "lucide-react";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import type { Booking, Property } from "@shared/schema";

const statusFilters = ["all", "confirmed", "checked-in", "checked-out", "cancelled"] as const;

const statusStyles: Record<string, string> = {
  confirmed: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  "checked-in": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  "checked-out": "bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function Bookings() {
  const { data: bookings, isLoading } = useQuery<Booking[]>({ queryKey: ["/api/bookings"] });
  const { data: properties } = useQuery<Property[]>({ queryKey: ["/api/properties"] });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: (data: Partial<Booking>) => apiRequest("POST", "/api/bookings", data),
    onSuccess: async (res) => {
      const booking = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setIsDialogOpen(false);
      // Show toast with copy check-in link action
      const url = `${window.location.origin}${window.location.pathname}#/checkin/${booking.id}`;
      toast({
        title: "Booking created",
        description: "Check-in link is ready to share with your on-site staff.",
      });
      // Auto-copy check-in link
      try { await navigator.clipboard.writeText(url); } catch {}
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      propertyId: fd.get("propertyId") as string,
      guestName: fd.get("guestName") as string,
      guestEmail: fd.get("guestEmail") as string,
      guestPhone: fd.get("guestPhone") as string,
      guestIdNumber: fd.get("guestIdNumber") as string,
      checkIn: fd.get("checkIn") as string,
      checkOut: fd.get("checkOut") as string,
      numberOfGuests: parseInt(fd.get("numberOfGuests") as string) || 1,
      notes: fd.get("notes") as string,
      status: "confirmed",
      idVerified: false,
    });
  };

  const getPropertyName = (id: string) =>
    properties?.find((p) => p.id === id)?.name || "\u2014";

  const copyCheckInLink = async (bookingId: string) => {
    const url = `${window.location.origin}${window.location.pathname}#/checkin/${bookingId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Check-in link copied", description: "Share this with your on-site staff." });
    } catch {
      toast({ title: "Link generated", description: url });
    }
  };

  const filtered = activeFilter === "all"
    ? bookings
    : bookings?.filter((b) => b.status === activeFilter);

  const hasProperties = properties && properties.length > 0;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          {bookings && bookings.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {bookings.length} total {bookings.length === 1 ? "booking" : "bookings"}
            </p>
          )}
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-1.5"
              disabled={!hasProperties}
              title={!hasProperties ? "Add a property first" : undefined}
              data-testid="button-add-booking"
            >
              <Plus className="w-4 h-4" />
              Add Booking
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Booking</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <Label htmlFor="propertyId">Property</Label>
                <Select name="propertyId" required>
                  <SelectTrigger data-testid="select-property">
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label htmlFor="guestName">Guest Name</Label>
                  <Input id="guestName" name="guestName" placeholder="Full name" required data-testid="input-guest-name" />
                </div>
                <div>
                  <Label htmlFor="guestEmail">Email</Label>
                  <Input id="guestEmail" name="guestEmail" type="email" placeholder="guest@email.com" />
                </div>
                <div>
                  <Label htmlFor="guestPhone">Phone</Label>
                  <Input id="guestPhone" name="guestPhone" placeholder="+54 ..." />
                </div>
                <div>
                  <Label htmlFor="guestIdNumber">ID / Passport Number</Label>
                  <Input id="guestIdNumber" name="guestIdNumber" placeholder="For verification" />
                </div>
                <div>
                  <Label htmlFor="numberOfGuests">Guests</Label>
                  <Input id="numberOfGuests" name="numberOfGuests" type="number" min={1} defaultValue={1} />
                </div>
                <div>
                  <Label htmlFor="checkIn">Check-in Date</Label>
                  <Input id="checkIn" name="checkIn" type="date" required />
                </div>
                <div>
                  <Label htmlFor="checkOut">Check-out Date</Label>
                  <Input id="checkOut" name="checkOut" type="date" required />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" rows={2} placeholder="Late arrival, special requests, etc." />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-booking">
                Create Booking
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !hasProperties ? (
        /* ── No properties yet ── */
        <div className="flex flex-col items-center text-center py-16 px-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-primary/40" />
          </div>
          <h3 className="text-base font-semibold mb-1.5">Add a property first</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-5 leading-relaxed">
            You need at least one property before you can create bookings.
          </p>
          <Link href="/admin/properties">
            <Button className="gap-1.5">
              <Plus className="w-4 h-4" />
              Add Property
            </Button>
          </Link>
        </div>
      ) : !bookings || bookings.length === 0 ? (
        /* ── No bookings yet ── */
        <div className="flex flex-col items-center text-center py-16 px-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/8 flex items-center justify-center mb-4">
            <CalendarCheck className="w-8 h-8 text-amber-500/40" />
          </div>
          <h3 className="text-base font-semibold mb-1.5">No bookings yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-5 leading-relaxed">
            Add your first booking and share the check-in link with your on-site staff for guest verification.
          </p>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-1.5" data-testid="empty-add-booking">
            <Plus className="w-4 h-4" />
            Add First Booking
          </Button>
        </div>
      ) : (
        <>
          {/* Status filter tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {statusFilters.map((s) => {
              const count = s === "all" ? bookings.length : bookings.filter((b) => b.status === s).length;
              return (
                <Button
                  key={s}
                  variant={activeFilter === s ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setActiveFilter(s)}
                  className="text-xs capitalize gap-1.5"
                  data-testid={`filter-${s}`}
                >
                  {s === "all" ? "All" : s.replace("-", " ")}
                  <span className={`text-[10px] tabular-nums ${activeFilter === s ? "opacity-70" : "text-muted-foreground"}`}>
                    {count}
                  </span>
                </Button>
              );
            })}
          </div>

          {/* Table */}
          <Card className="border border-card-border">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Guest</TableHead>
                      <TableHead className="text-xs">Property</TableHead>
                      <TableHead className="text-xs">Dates</TableHead>
                      <TableHead className="text-xs">ID</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered?.map((b) => (
                      <TableRow key={b.id} data-testid={`booking-row-${b.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-primary/8 flex items-center justify-center shrink-0">
                              <span className="text-[10px] font-semibold text-primary">
                                {b.guestName?.charAt(0)?.toUpperCase() || "?"}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{b.guestName}</p>
                              {b.guestEmail && (
                                <p className="text-[11px] text-muted-foreground truncate">{b.guestEmail}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{getPropertyName(b.propertyId)}</TableCell>
                        <TableCell className="text-xs tabular-nums whitespace-nowrap">
                          {b.checkIn} — {b.checkOut}
                        </TableCell>
                        <TableCell>
                          {b.idVerified ? (
                            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                              <ShieldCheck className="w-3.5 h-3.5" /> Verified
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                              <ShieldAlert className="w-3.5 h-3.5" /> Pending
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${statusStyles[b.status] || ""}`}>
                            {b.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-7 px-2.5 text-xs gap-1"
                              onClick={() => copyCheckInLink(b.id)}
                              data-testid={`copy-checkin-${b.id}`}
                            >
                              <Link2 className="w-3 h-3" />
                              Copy Link
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => window.open(`#/checkin/${b.id}`, "_blank")}
                              title="Open check-in portal"
                              data-testid={`open-checkin-${b.id}`}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                          No bookings match this filter.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
