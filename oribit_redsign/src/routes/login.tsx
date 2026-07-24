import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { OrbitMark } from "@/components/orbit/orbit-mark";
import { AuroraBlob } from "@/components/orbit/aurora-blob";
import { ArrowRight } from "lucide-react";
import { useStore } from "@/lib/mock-store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Orbit" },
      { name: "description", content: "Sign back into your Orbit workspace." },
      { property: "og:title", content: "Sign in — Orbit" },
      { property: "og:description", content: "Sign back into your Orbit workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const login = useStore((s) => s.login);
  const [email, setEmail] = useState("ava@orbit.app");
  const [loading, setLoading] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login(email, "Ava Chen");
      navigate({ to: "/app/projects" });
    }, 400);
  }

  return <AuthShell title="Welcome back" subtitle="Sign in to keep the work moving.">
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pw">Password</Label>
        <Input id="pw" type="password" defaultValue="demo-pass" required />
      </div>
      <Button type="submit" className="w-full rounded-full" size="lg" disabled={loading}>
        {loading ? "Signing in…" : (<>Sign in <ArrowRight className="ml-2 h-4 w-4" /></>)}
      </Button>
      <p className="pt-2 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Create one
        </Link>
      </p>
    </form>
  </AuthShell>;
}

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
        <Link to="/" className="flex items-center gap-2">
          <OrbitMark />
          <span className="font-display text-lg font-bold tracking-tight">Orbit</span>
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto w-full max-w-sm"
        >
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </motion.div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Orbit</p>
      </div>
      <div className="relative hidden overflow-hidden bg-secondary/50 lg:block">
        <AuroraBlob className="pointer-events-none absolute inset-0" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center p-16 text-center">
          <div className="relative">
            <OrbitMark size={140} />
          </div>
          <p className="mt-10 max-w-md font-display text-2xl leading-snug tracking-tight">
            "Orbit is the first project tool my team actually keeps open all day."
          </p>
          <p className="mt-3 text-sm text-muted-foreground">— Milo Ray, Head of Product</p>
        </div>
      </div>
    </div>
  );
}
