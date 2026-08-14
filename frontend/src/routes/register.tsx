import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AuthShell } from "@/components/orbit/auth-shell";
import { useAuth } from "@/auth";
import { api } from "@/api";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your workspace — Orbit" },
      { name: "description", content: "Create a clear shared workspace for your team in Orbit." },
      { property: "og:title", content: "Create your workspace — Orbit" },
      { property: "og:description", content: "Create a clear shared workspace for your team in Orbit." },
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
  const [role, setRole] = useState<"user" | "admin">("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await api.register(name, email, password, role) as { user: import("@/types").User };
      setUser(data.user);
      navigate({ to: "/app" });
    } catch {
      setError("Registration failed. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell compact title="Create your workspace" subtitle="Set up a clear shared record for your team and its work.">
      <form onSubmit={submit} className="space-y-4 lg:space-y-2" data-testid="register-form">
        {error && (
          <div className="border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="auth-field">
          <Label className="auth-field-label" htmlFor="name">Full name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Username"
            required
            className="!h-7 !border-0 !bg-transparent !px-0 !py-0 !shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0"
          />
        </div>
        <div className="auth-field">
          <Label className="auth-field-label" htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            className="!h-7 !border-0 !bg-transparent !px-0 !py-0 !shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0"
          />
        </div>
        <div className="auth-field">
          <Label className="auth-field-label" htmlFor="pw">Password</Label>
          <Input
            id="pw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={4}
            className="!h-7 !border-0 !bg-transparent !px-0 !py-0 !shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0"
          />
        </div>
        <div className="auth-field">
          <Label className="auth-field-label" htmlFor="role">Role</Label>
          <Select value={role} onValueChange={(v) => setRole(v as "user" | "admin")}>
            <SelectTrigger className="!h-7 w-full !border-0 !bg-transparent !px-0 !py-0 !text-base !shadow-none focus:!ring-0">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User — Standard access</SelectItem>
              <SelectItem value="admin">Admin — Full workspace access</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" size="lg" className="ledger-action w-full" disabled={loading}>
          {loading ? "Creating..." : <><span>Create workspace</span><ArrowRight className="ml-2 h-4 w-4" /></>}
        </Button>
        <p className="pt-2 text-center text-sm text-muted-foreground lg:pt-1">
          Already have one?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}