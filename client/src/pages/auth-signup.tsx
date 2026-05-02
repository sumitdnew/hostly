import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";

export default function AuthSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(email, password, name, orgName);
      navigate("/admin");
    } catch (err: any) {
      const msg = err.message || "Signup failed";
      if (msg.includes("409")) {
        setError("This email is already registered");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center gap-2.5 mb-8">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Building2 className="w-4.5 h-4.5 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Hostly</span>
      </Link>

      <Card className="w-full max-w-sm border border-card-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Create your account</CardTitle>
          <p className="text-sm text-muted-foreground">Start managing your properties</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                required
                data-testid="input-name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                data-testid="input-email"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                minLength={6}
                data-testid="input-password"
              />
            </div>
            <div>
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="My Properties LLC"
                required
                data-testid="input-org-name"
              />
              <p className="text-xs text-muted-foreground mt-1">Your company or team name</p>
            </div>

            {error && (
              <p className="text-sm text-destructive" data-testid="auth-error">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading} data-testid="button-signup">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Account
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>

      <div className="mt-8">
        <PerplexityAttribution />
      </div>
    </div>
  );
}
