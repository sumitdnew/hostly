import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  MessageCircle,
  Wrench,
  Menu,
  X,
  LogOut,
  Users,
  ChevronRight,
  Bell,
  Search,
  Settings,
  HelpCircle,
  Home,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import { useAuth } from "@/lib/auth";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, description: "Overview & stats" },
  { href: "/admin/properties", label: "Properties", icon: Building2, description: "Your listings" },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck, description: "Reservations" },
  { href: "/admin/messages", label: "Messages", icon: MessageCircle, description: "Guest chat" },
  { href: "/admin/maintenance", label: "Maintenance", icon: Wrench, description: "Issues & repairs" },
  { href: "/admin/team", label: "Team", icon: Users, description: "Staff & roles" },
];

function UserAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const sizeClasses = size === "sm" ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-xs";
  return (
    <div
      className={`${sizeClasses} rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center shrink-0`}
    >
      {initials}
    </div>
  );
}

function OrgBadge({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 mx-3 rounded-lg bg-accent/60">
      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-primary-foreground">{initial}</span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold truncate text-sidebar-foreground">{name}</p>
        <p className="text-[10px] text-muted-foreground leading-tight">Organization</p>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, org, logout } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const currentPage = navItems.find(
    (n) => n.href === location || (n.href !== "/admin" && location.startsWith(n.href))
  );
  const pageTitle = currentPage?.label || "Dashboard";
  const pageDescription = currentPage?.description || "";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-[260px] bg-sidebar border-r border-sidebar-border
          flex flex-col
          transform transition-transform duration-200 ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 shrink-0">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Home className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-sidebar-foreground" data-testid="app-logo">
              Hostly
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(false)}
            data-testid="close-sidebar"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Org badge */}
        {org && (
          <div className="pb-3 shrink-0">
            <OrgBadge name={org.name} />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          <p className="px-3 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Manage
          </p>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = location === href || (href !== "/admin" && location.startsWith(href));
            return (
              <Link key={href} href={href}>
                <div
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium
                    transition-all duration-150 cursor-pointer group
                    ${isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }
                  `}
                  data-testid={`nav-${label.toLowerCase()}`}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <span className="flex-1">{label}</span>
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom user section */}
        <div className="mt-auto border-t border-sidebar-border shrink-0">
          {user && (
            <div className="px-3 py-3">
              <div className="flex items-center gap-2.5 px-2">
                <UserAvatar name={user.name} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate text-sidebar-foreground">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                      onClick={handleLogout}
                      data-testid="button-logout"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Sign out</TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}
          <div className="px-5 pb-3">
            <PerplexityAttribution />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-border flex items-center px-4 lg:px-6 shrink-0 bg-background/80 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden mr-3"
            onClick={() => setMobileOpen(true)}
            data-testid="open-sidebar"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-foreground" data-testid="page-title">
              {pageTitle}
            </h1>
            {pageDescription && (
              <p className="text-[11px] text-muted-foreground hidden sm:block">{pageDescription}</p>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <Search className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Search</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <Bell className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
