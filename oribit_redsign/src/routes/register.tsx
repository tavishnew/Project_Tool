import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AuthShell } from "./login";
import { useStore } from "@/lib/mock-store";

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
  const login = useStore((s) => s.login);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    login(email || "you@orbit.app", name || "New User");
    navigate({ to: "/app/projects" });
  }

  return (
    <AuthShell title="Create your workspace" subtitle="It takes about ten seconds. Really.">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ada@company.com" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pw">Password</Label>
          <Input id="pw" type="password" required minLength={4} />
        </div>
        <Button type="submit" size="lg" className="w-full rounded-full">
          Create workspace <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <p className="pt-2 text-center text-sm text-muted-foreground">
          Already have one?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
