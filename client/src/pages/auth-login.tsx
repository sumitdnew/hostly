import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";

export default function AuthLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err: any) {
      const msg = err.message || "Login failed";
      if (msg.includes("401")) {
        setError("Invalid email or password");
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
          <CardTitle className="text-lg">Welcome back</CardTitle>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Your password"
                required
                data-testid="input-password"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive" data-testid="auth-error">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading} data-testid="button-login">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Sign In
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-4">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary font-medium hover:underline">
              Sign up
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
