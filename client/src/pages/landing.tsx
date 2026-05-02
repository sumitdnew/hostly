import { Link } from "wouter";
import { Building2, MessageCircle, ShieldCheck, Wrench, ArrowRight, Sparkles, BarChart3, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Hostly</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" data-testid="nav-login">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" data-testid="nav-signup">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-20 pb-16 sm:pt-28 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            AI-powered guest communication
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight text-foreground">
            Manage your Airbnbs
            <br />
            <span className="text-primary">without the middleman</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Replace your property manager with an intelligent platform. Automate guest communication, streamline check-ins, and coordinate maintenance — all from one dashboard.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <Link href="/signup">
              <Button size="lg" className="gap-2" data-testid="hero-cta">
                Start Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="secondary" size="lg">
                See Features
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center">
            {[
              { value: "15%+", label: "Commission saved" },
              { value: "24/7", label: "AI guest support" },
              { value: "< 5s", label: "Response time" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">{value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 bg-card/50 border-y border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Everything your property manager does, automated</h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Built for hosts with 2-50 properties who want to take back control.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: MessageCircle,
                title: "AI Guest Communication",
                desc: "Answers guest questions instantly — check-in instructions, Wi-Fi, house rules, local tips. Knows each property's details.",
              },
              {
                icon: ShieldCheck,
                title: "ID Verification Portal",
                desc: "Mobile-friendly check-in link for each booking. On-site staff verify guest ID and unlock property details.",
              },
              {
                icon: Wrench,
                title: "Maintenance Tracking",
                desc: "Log issues, assign staff, track resolution. Priority levels and status updates keep everything moving.",
              },
              {
                icon: Building2,
                title: "Multi-Property Dashboard",
                desc: "See all your properties, bookings, and occupancy at a glance. Real-time stats and upcoming arrivals.",
              },
              {
                icon: Users,
                title: "Team Roles",
                desc: "Invite cleaners, maintenance workers, and co-hosts as staff. They see only what they need.",
              },
              {
                icon: BarChart3,
                title: "Occupancy Analytics",
                desc: "Track active stays, upcoming bookings, and occupancy rates across your portfolio.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-5 rounded-xl border border-card-border bg-card"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Up and running in minutes</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Create your account", desc: "Sign up and set up your organization in seconds." },
              { step: "2", title: "Add your properties", desc: "Enter property details, check-in instructions, and house rules." },
              { step: "3", title: "Add bookings, let AI handle guests", desc: "Import bookings, share check-in links, and let AI answer guest questions." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center mx-auto mb-4">
                  {step}
                </div>
                <h3 className="text-sm font-semibold mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-primary/5 border-t border-border/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Stop paying commission. Start managing smarter.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Join hosts who save thousands per month by replacing their property manager with Hostly.
          </p>
          <Link href="/signup">
            <Button size="lg" className="gap-2 mt-6" data-testid="bottom-cta">
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Building2 className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Hostly</span>
          </div>
          <PerplexityAttribution />
        </div>
      </footer>
    </div>
  );
}
