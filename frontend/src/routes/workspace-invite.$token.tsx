import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { api } from "@/api";
import { AuthShell } from "@/components/orbit/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/workspace-invite/$token")({
  head: () => ({
    meta: [
      { title: "Join your workspace — Orbit" },
      { name: "description", content: "Complete your Orbit workspace invitation and create your account." },
    ],
  }),
  component: WorkspaceInvitePage,
});

function WorkspaceInvitePage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    setError(null);

    if (password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }
    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.acceptWorkspaceInvite(token, name.trim(), password);
      setAccepted(true);
      window.setTimeout(() => navigate({ to: "/login" }), 1400);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "This invitation could not be accepted.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell compact title="Join your workspace" subtitle="Create your Orbit account to accept this invitation and start collaborating.">
      {accepted ? (
        <div className="ledger-frame space-y-4 border-success/35 p-5" role="status">
          <CheckCircle2 className="h-6 w-6 text-success" aria-hidden="true" />
          <div>
            <p className="font-display text-2xl font-semibold">Your account is ready.</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Taking you to sign in with your new account…</p>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3.5" data-testid="workspace-invite-form">
          <div className="rounded-none border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm leading-5 text-muted-foreground">
            <ShieldCheck className="mr-2 inline h-4 w-4 text-primary" aria-hidden="true" />
            This invitation creates a standard workspace account for its intended email address.
          </div>
          {error && <div className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">{error}</div>}
          <div className="auth-field">
            <Label className="auth-field-label" htmlFor="name">Full name</Label>
            <Input id="name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ada Lovelace" required className="!h-7 !border-0 !bg-transparent !px-0 !py-0 !shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0" />
          </div>
          <div className="auth-field">
            <Label className="auth-field-label" htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} className="!h-7 !border-0 !bg-transparent !px-0 !py-0 !shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0" />
          </div>
          <div className="auth-field">
            <Label className="auth-field-label" htmlFor="password-confirmation">Confirm password</Label>
            <Input id="password-confirmation" type="password" autoComplete="new-password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} required minLength={8} className="!h-7 !border-0 !bg-transparent !px-0 !py-0 !shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0" />
          </div>
          <Button type="submit" size="lg" className="ledger-action w-full" disabled={loading}>
            {loading ? "Creating account…" : <><span>Join workspace</span><ArrowRight className="ml-2 h-4 w-4" /></>}
          </Button>
          <p className="pt-1 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
