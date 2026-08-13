import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/orbit/auth-shell";
import { useAuth } from "@/auth";
import { api } from "@/api";
import { ArrowRight, KeyRound } from "lucide-react";

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
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [recoveryAvailable, setRecoveryAvailable] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [codeRequested, setCodeRequested] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [requestingCode, setRequestingCode] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  function resetRecoveryState() {
    setRecoveryAvailable(false);
    setRecoveryEmail("");
    setCodeRequested(false);
    setVerificationCode("");
    setNewPassword("");
    setPasswordConfirmation("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (cooldown > 0 || loading) return;
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    resetRecoveryState();
    try {
      const data = await api.login(email, password) as { user: import("@/types").User };
      setUser(data.user);
      const pendingInvitation = window.localStorage.getItem("pendingProjectInvite");
      if (pendingInvitation) {
        try {
          const invitation = await api.acceptProjectInvitation(pendingInvitation);
          window.localStorage.removeItem("pendingProjectInvite");
          navigate({ to: "/app/projects/$id", params: { id: invitation.projectId } });
          return;
        } catch {
          // A login remains valid even if the stored invitation is expired or belongs to another address.
          window.localStorage.removeItem("pendingProjectInvite");
        }
      }
      navigate({ to: "/app/projects" });
    } catch (caught) {
      const errorWithStatus = caught as Error & {
        status?: number;
        retryAfter?: number;
        attemptsRemaining?: number;
        recoveryAvailable?: boolean;
      };
      if (errorWithStatus.status === 429) {
        const seconds = Math.max(1, Math.ceil(errorWithStatus.retryAfter || 60));
        setCooldown(seconds);
        setError(`Too many sign-in attempts. Please wait ${seconds} seconds before trying again.`);
      } else {
        const recoveryReady = errorWithStatus.status === 401 && errorWithStatus.recoveryAvailable === true;
        setRecoveryAvailable(recoveryReady);
        if (recoveryReady) {
          setRecoveryEmail(email.trim().toLowerCase());
          setError("You have reached five unsuccessful sign-in attempts. Verify your email to update your password.");
        } else if (errorWithStatus.status === 401 && typeof errorWithStatus.attemptsRemaining === "number") {
          const suffix = errorWithStatus.attemptsRemaining === 1 ? "attempt" : "attempts";
          setError(`Invalid email or password. ${errorWithStatus.attemptsRemaining} ${suffix} remaining before password recovery is offered.`);
        } else {
          setError(errorWithStatus.message || "Invalid email or password");
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function requestVerificationCode() {
    if (!recoveryEmail || requestingCode) return;
    setRequestingCode(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await api.requestPasswordUpdateCode(recoveryEmail);
      setCodeRequested(true);
      setSuccessMessage("If the recovery requirements are met, a 6-digit verification code has been sent to your email.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to request a verification code.");
    } finally {
      setRequestingCode(false);
    }
  }

  async function updatePassword() {
    if (!recoveryEmail || updatingPassword) return;
    setUpdatingPassword(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const result = await api.completePasswordUpdate(recoveryEmail, verificationCode, newPassword, passwordConfirmation);
      setPassword("");
      setVerificationCode("");
      setNewPassword("");
      setPasswordConfirmation("");
      setCodeRequested(false);
      setRecoveryAvailable(false);
      setSuccessMessage(result.message);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update password.");
    } finally {
      setUpdatingPassword(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to keep the work moving." data-testid="login-page">
      <form onSubmit={onSubmit} className="space-y-3.5" data-testid="login-form">
        {error && (
          <div className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
            <p>{error}</p>
            {recoveryAvailable && !codeRequested && (
              <Button type="button" variant="link" className="mt-1 h-auto px-0 font-semibold text-destructive underline underline-offset-4 hover:opacity-80" onClick={requestVerificationCode} disabled={requestingCode}>
                {requestingCode ? "Sending verification code…" : "Update your password"}
              </Button>
            )}
          </div>
        )}
        {successMessage && (
          <div className="border border-success/35 bg-success/10 px-4 py-3 text-sm text-success" role="status">
            {successMessage}
          </div>
        )}
        <div className="auth-field">
          <Label className="auth-field-label" htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              resetRecoveryState();
              setSuccessMessage(null);
            }}
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
            className="!h-7 !border-0 !bg-transparent !px-0 !py-0 !shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0"
          />
        </div>
        <Button type="submit" className="ledger-action w-full" size="lg" disabled={loading || cooldown > 0}>
          {loading ? "Signing in…" : cooldown > 0 ? `Try again in ${cooldown}s` : <><span>Sign in</span><ArrowRight className="ml-2 h-4 w-4" /></>}
        </Button>

        {recoveryAvailable && codeRequested && (
          <section className="ledger-frame space-y-3 border-primary/30 p-4" aria-labelledby="password-update-title">
            <div className="flex items-start gap-2">
              <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <p className="ledger-caption text-muted-foreground">Account recovery</p>
                <h2 id="password-update-title" className="mt-1 text-sm font-semibold">Update password</h2>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">Enter the 6-digit code sent to {recoveryEmail}, then choose and confirm a new password.</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="auth-field sm:col-span-2">
                <Label className="auth-field-label" htmlFor="verification-code">Verification code</Label>
                <Input id="verification-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit code" className="!h-7 !border-0 !bg-transparent !px-0 !py-0 !shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0" />
              </div>
              <div className="auth-field">
                <Label className="auth-field-label" htmlFor="new-password">New password</Label>
                <Input id="new-password" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" className="!h-7 !border-0 !bg-transparent !px-0 !py-0 !shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0" />
              </div>
              <div className="auth-field">
                <Label className="auth-field-label" htmlFor="confirm-password">Confirm new password</Label>
                <Input id="confirm-password" type="password" autoComplete="new-password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} className="!h-7 !border-0 !bg-transparent !px-0 !py-0 !shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0" />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" size="sm" className="ledger-action" onClick={updatePassword} disabled={updatingPassword || verificationCode.length !== 6 || newPassword.length < 8 || passwordConfirmation.length < 8}>
                {updatingPassword ? "Updating password…" : "Save new password"}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={requestVerificationCode} disabled={requestingCode}>
                {requestingCode ? "Sending…" : "Send a new code"}
              </Button>
            </div>
          </section>
        )}

        <p className="pt-2 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
