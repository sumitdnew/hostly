import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  CalendarCheck,
  Clock,
  Wrench,
  TrendingUp,
  ArrowRight,
  Plus,
  CheckCircle2,
  Circle,
  Sparkles,
  Users,
  PlaneLanding,
  PlaneTakeoff,
} from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import type { Booking, Property, MaintenanceRequest } from "@shared/schema";

/* ── Onboarding Checklist ── */
function OnboardingChecklist({ stats }: { stats: any }) {
  const steps = [
    { label: "Create your account", done: true },
    {
      label: "Add your first property",
      done: (stats?.totalProperties ?? 0) > 0,
      href: "/admin/properties",
      cta: "Add Property",
    },
    {
      label: "Create a booking",
      done: (stats?.totalBookings ?? 0) > 0,
      href: "/admin/bookings",
      cta: "Add Booking",
    },
    {
      label: "Invite your team",
      done: false, // We can't know from stats alone, keep as reminder
      href: "/admin/team",
      cta: "Invite Staff",
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const progress = (completedCount / steps.length) * 100;

  // Hide once at least 3/4 done (account + property + booking)
  if (completedCount >= 3) return null;

  return (
    <Card className="border border-card-border overflow-hidden">
      <div className="bg-gradient-to-r from-primary/8 via-primary/4 to-transparent px-5 py-4">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Getting Started</h3>
          </div>
          <span className="text-[11px] text-muted-foreground font-medium tabular-nums">
            {completedCount} of {steps.length}
          </span>
        </div>
        <div className="h-1.5 bg-background/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <CardContent className="p-0 divide-y divide-card-border">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-5 py-3 ${step.done ? "opacity-50" : ""}`}
          >
            {step.done ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground/30 shrink-0" />
            )}
            <span
              className={`text-sm flex-1 ${
                step.done ? "line-through text-muted-foreground" : "font-medium"
              }`}
            >
              {step.label}
            </span>
            {!step.done && step.href && (
              <Link href={step.href}>
                <Button variant="secondary" size="sm" className="text-xs h-7 px-3 gap-1">
                  {step.cta}
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* ── Empty / First-Time Dashboard ── */
function EmptyDashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-card-border p-6 sm:p-8">
        <div className="relative z-10 max-w-md">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Welcome to Hostly</p>
          <h2 className="text-xl font-bold tracking-tight mb-2">
            Hey {firstName}, let's set up your properties
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Start by adding your first property. Once that's done, you can create bookings,
            share check-in links with guests, and coordinate your team — all from here.
          </p>
          <Link href="/admin/properties">
            <Button className="mt-5 gap-2" data-testid="cta-add-first-property">
              <Plus className="w-4 h-4" />
              Add Your First Property
            </Button>
          </Link>
        </div>
        <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-primary/5 rounded-full blur-2xl" />
        <div className="absolute right-16 top-4 w-20 h-20 bg-primary/8 rounded-full blur-xl" />
      </div>

      {/* Quick-start cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: Building2, label: "Properties", desc: "Add and manage your listings", href: "/admin/properties" },
          { icon: CalendarCheck, label: "Bookings", desc: "Track guest reservations", href: "/admin/bookings" },
          { icon: Users, label: "Team", desc: "Invite cleaners and co-hosts", href: "/admin/team" },
        ].map(({ icon: Icon, label, desc, href }) => (
          <Link key={href} href={href}>
            <Card className="border border-card-border cursor-pointer transition-all duration-150 hover:border-primary/20 hover:shadow-sm group h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0 transition-colors group-hover:bg-primary/10">
                  <Icon className="w-5 h-5 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground/20 shrink-0 transition-colors group-hover:text-primary/40" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── Active Dashboard ── */
export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalProperties: number;
    activeBookings: number;
    upcomingBookings: number;
    openMaintenance: number;
    occupancyRate: number;
    todayArrivals: number;
    todayDepartures: number;
    totalBookings: number;
  }>({ queryKey: ["/api/stats"] });

  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: properties } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: maintenance } = useQuery<MaintenanceRequest[]>({
    queryKey: ["/api/maintenance"],
  });

  // Show empty state if no properties
  if (!statsLoading && stats && stats.totalProperties === 0) {
    return <EmptyDashboard />;
  }

  const firstName = user?.name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const upcomingBookings = bookings
    ?.filter((b) => b.status === "confirmed")
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
    .slice(0, 5);

  const openMaintenance = maintenance
    ?.filter((m) => m.status !== "resolved")
    .slice(0, 5);

  const getPropertyName = (id: string) =>
    properties?.find((p) => p.id === id)?.name || "Unknown";

  const kpis = [
    { label: "Properties", value: stats?.totalProperties, icon: Building2, accent: "text-primary", bg: "bg-primary/8", href: "/admin/properties" },
    { label: "Active Stays", value: stats?.activeBookings, icon: CalendarCheck, accent: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/8", href: "/admin/bookings" },
    { label: "Upcoming", value: stats?.upcomingBookings, icon: Clock, accent: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/8", href: "/admin/bookings" },
    { label: "Open Issues", value: stats?.openMaintenance, icon: Wrench, accent: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/8", href: "/admin/maintenance" },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight">{greeting}, {firstName}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here's what's happening across your properties.
          </p>
        </div>
        <Link href="/admin/bookings">
          <Button size="sm" className="gap-1.5 shrink-0" data-testid="dashboard-add-booking">
            <Plus className="w-3.5 h-3.5" />
            New Booking
          </Button>
        </Link>
      </div>

      {/* Today strip — only if there are today events */}
      {stats && (stats.todayArrivals > 0 || stats.todayDepartures > 0) && (
        <div className="flex items-center gap-3 flex-wrap">
          {stats.todayArrivals > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/8 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
              <PlaneLanding className="w-3.5 h-3.5" />
              {stats.todayArrivals} arriving today
            </div>
          )}
          {stats.todayDepartures > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/8 text-blue-700 dark:text-blue-400 text-xs font-medium">
              <PlaneTakeoff className="w-3.5 h-3.5" />
              {stats.todayDepartures} departing today
            </div>
          )}
        </div>
      )}

      {/* Onboarding — hides once mostly complete */}
      <OnboardingChecklist stats={stats} />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(({ label, value, icon: Icon, accent, bg, href }) => (
          <Link key={label} href={href}>
            <Card className="border border-card-border cursor-pointer transition-all duration-150 hover:shadow-sm hover:border-primary/15 h-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon className={`w-[18px] h-[18px] ${accent}`} />
                  </div>
                  {label === "Properties" && stats && stats.occupancyRate > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <TrendingUp className="w-3 h-3" />
                      {stats.occupancyRate}% occ.
                    </div>
                  )}
                </div>
                {statsLoading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <p className="text-2xl font-bold tabular-nums" data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>
                    {value ?? 0}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Two-column: Bookings + Maintenance */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Upcoming Bookings */}
        <Card className="border border-card-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between gap-1">
            <CardTitle className="text-sm font-semibold">Upcoming Bookings</CardTitle>
            <Link href="/admin/bookings">
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-muted-foreground gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {bookingsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : !upcomingBookings || upcomingBookings.length === 0 ? (
              <div className="py-8 text-center">
                <CalendarCheck className="w-8 h-8 text-muted-foreground/15 mx-auto mb-2" />
                <p className="text-sm font-medium text-muted-foreground">No upcoming bookings</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5 mb-3">
                  Add a booking to see it here.
                </p>
                <Link href="/admin/bookings">
                  <Button variant="secondary" size="sm" className="text-xs gap-1">
                    <Plus className="w-3 h-3" /> Add Booking
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-accent/40 transition-colors hover:bg-accent/60"
                    data-testid={`booking-item-${b.id}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/8 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-primary">
                        {b.guestName?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{b.guestName}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {getPropertyName(b.propertyId)} · {b.checkIn} — {b.checkOut}
                      </p>
                    </div>
                    <Badge
                      variant={b.idVerified ? "default" : "secondary"}
                      className="shrink-0 text-[10px]"
                    >
                      {b.idVerified ? "Verified" : "Pending ID"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Open Maintenance */}
        <Card className="border border-card-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between gap-1">
            <CardTitle className="text-sm font-semibold">Open Maintenance</CardTitle>
            <Link href="/admin/maintenance">
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-muted-foreground gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {!maintenance ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : !openMaintenance || openMaintenance.length === 0 ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/20 mx-auto mb-2" />
                <p className="text-sm font-medium text-muted-foreground">All clear</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">No open maintenance issues.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {openMaintenance.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-accent/40 transition-colors hover:bg-accent/60"
                    data-testid={`maintenance-item-${m.id}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        m.priority === "high" ? "bg-rose-500/10" : m.priority === "medium" ? "bg-amber-500/10" : "bg-accent"
                      }`}
                    >
                      <Wrench
                        className={`w-3.5 h-3.5 ${
                          m.priority === "high" ? "text-rose-500" : m.priority === "medium" ? "text-amber-500" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{m.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {getPropertyName(m.propertyId)} · {m.assignedTo || "Unassigned"}
                      </p>
                    </div>
                    <Badge
                      variant={m.priority === "high" ? "destructive" : "secondary"}
                      className="shrink-0 text-[10px]"
                    >
                      {m.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
