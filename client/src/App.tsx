import { Switch, Route, Router, useLocation, Redirect } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";

import Landing from "@/pages/landing";
import AuthLogin from "@/pages/auth-login";
import AuthSignup from "@/pages/auth-signup";
import Dashboard from "@/pages/dashboard";
import Properties from "@/pages/properties";
import Bookings from "@/pages/bookings";
import GuestChat from "@/pages/guest-chat";
import Maintenance from "@/pages/maintenance";
import Team from "@/pages/team";
import CheckIn from "@/pages/check-in";
import AppLayout from "@/components/app-layout";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function AdminRoutes() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/admin" component={Dashboard} />
        <Route path="/admin/properties" component={Properties} />
        <Route path="/admin/bookings" component={Bookings} />
        <Route path="/admin/messages" component={GuestChat} />
        <Route path="/admin/maintenance" component={Maintenance} />
        <Route path="/admin/team" component={Team} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function MainApp() {
  const [location] = useLocation();

  // Guest check-in — fully public, no layout
  if (location.startsWith("/checkin/")) {
    return (
      <Switch>
        <Route path="/checkin/:bookingId" component={CheckIn} />
      </Switch>
    );
  }

  // Admin routes — protected
  if (location.startsWith("/admin")) {
    return <ProtectedRoute component={AdminRoutes} />;
  }

  // Public routes
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={AuthLogin} />
      <Route path="/signup" component={AuthSignup} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router hook={useHashLocation}>
            <MainApp />
          </Router>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
