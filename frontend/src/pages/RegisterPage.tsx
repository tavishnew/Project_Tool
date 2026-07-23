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
import { AuthShell } from "./LoginPage";

export default function RegisterPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [searchParams] = useSearchParams();
  const invite = searchParams.get("invite");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return setError("Password must be at least 6 characters");
    setBusy(true);
    setError("");
    try {
      const { user } = await api.register(name, email, password, role);
      setUser(user);
      notify(`Account created — welcome, ${user.name}!`);
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
      setError(err instanceof Error ? err.message : "Registration failed");
      setBusy(false);
    }
  };

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
        <div className="space-y-1.5">
          <Label htmlFor="role">Account type</Label>
          <select id="role" className="select" value={role} onChange={(e) => setRole(e.target.value as "user" | "admin")}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <Button type="submit" size="lg" className="w-full rounded-full" disabled={busy}>
          Create workspace <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <p className="pt-2 text-center text-sm text-muted-foreground">
          Already have one?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
        </p>
      </form>
      {error && <div className="mt-4 text-sm text-destructive text-center">{error}</div>}
    </AuthShell>
  );
}