import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { api } from "@/api";
import { useAuth } from "@/auth";
import { useToast } from "@/components/Toast";
import { OrbitMark } from "@/components/orbit/OrbitMark";
import { AuroraBlob } from "@/components/orbit/AuroraBlob";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-svh overflow-hidden bg-background lg:grid lg:grid-cols-2">
      <div className="relative z-10 flex flex-col justify-between p-8 lg:p-12">
        <Link to="/" className="flex items-center gap-2" style={{ color: "hsl(var(--foreground))" }}>
          <OrbitMark />
          <span>Orbit</span>
        </Link>
        <div className="mx-auto w-full max-w-sm animate-fade-in-up">
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Orbit</p>
      </div>
      <div className="relative hidden overflow-hidden bg-secondary/50 lg:block">
        <AuroraBlob className="pointer-events-none absolute inset-0" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center p-16 text-center">
          <div className="relative"><OrbitMark size={140} /></div>
          <p className="mt-10 max-w-md font-display text-2xl leading-snug tracking-tight">"Orbit is the first project tool my team actually keeps open all day."</p>
          <p className="mt-3 text-sm text-muted-foreground">— Milo Ray, Head of Product</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [searchParams] = useSearchParams();
  const invite = searchParams.get("invite");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { user } = await api.login(email, password);
      setUser(user);
      notify(`Welcome back, ${user.name}`);
      if (invite) {
        try {
          const { projectId } = await api.acceptInvite(invite);
          navigate(`/projects/${projectId}`);
          return;
        } catch {
          // invite already used/expired — go to projects
        }
      }
      navigate("/projects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to keep the work moving.">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pw">Password</Label>
          <Input id="pw" type="password" defaultValue="demo-pass" required />
        </div>
        <Button type="submit" className="w-full rounded-full" size="lg" disabled={busy}>
          {busy ? "Signing in…" : <>Sign in <ArrowRight className="ml-2 h-4 w-4" /></>}
        </Button>
        <p className="pt-2 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">Create one</Link>
        </p>
      </form>
      {error && <div className="mt-4 text-sm text-destructive text-center">{error}</div>}
    </AuthShell>
  );
}