import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/orbit/auth-shell";
import { useAuth } from "@/auth";
import { api } from "@/api";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your workspace — Orbit" },
      { name: "description", content: "Spin up a new Orbit workspace in seconds." },
      { property: "og:title", content: "Create your workspace — Orbit" },
      { property: "og:description", content: "Spin up a new Orbit workspace in seconds." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await api.register(name, email, password) as { user: import("@/types").User };
      setUser(data.user);
      navigate({ to: "/app/projects" });
    } catch {
      setError("Registration failed. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Create your workspace" subtitle="It takes about ten seconds. Really.">
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Lovelace"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ada@company.com"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pw">Password</Label>
          <Input
            id="pw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={4}
          />
        </div>
        <Button type="submit" size="lg" className="w-full rounded-full" disabled={loading}>
          {loading ? "Creating…" : <><span>Create workspace</span><ArrowRight className="ml-2 h-4 w-4" /></>}
        </Button>
        <p className="pt-2 text-center text-sm text-muted-foreground">
          Already have one?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}