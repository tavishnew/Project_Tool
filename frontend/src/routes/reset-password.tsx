import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, type FormEvent, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/orbit/auth-shell";
import { api } from "@/api";
import { toast } from "sonner";
import { ArrowRight, Lock } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Orbit" },
      { name: "description", content: "Set a new password for your Orbit account." },
    ],
    validateSearch: (search: { token?: string }) => ({
      token: search.token,
    }),
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useSearch({ strict: false }) as { token?: string };
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validating, setValidating] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setValidating(false);
      setValidToken(false);
      return;
    }

    let cancelled = false;
    async function validate() {
      // token is guaranteed to exist here due to the guard above
      try {
        const result = await api.validateResetToken(token!);
        if (!cancelled) {
          setValidToken(result.valid);
          if (result.valid && result.email) {
            setUserEmail(result.email);
          }
        }
      } catch {
        if (!cancelled) {
          setValidToken(false);
        }
      } finally {
        if (!cancelled) {
          setValidating(false);
        }
      }
    }
    validate();
    return () => { cancelled = true; };
  }, [token]);

  if (validating) {
    return (
      <AuthShell title="Reset password" subtitle="Validating reset link...">
        <div className="text-center text-muted-foreground">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p>Validating reset link...</p>
        </div>
      </AuthShell>
    );
  }

  if (!token || !validToken) {
    return (
      <AuthShell title="Invalid link" subtitle="This password reset link is invalid or has expired.">
        <div className="text-center text-muted-foreground">
          <p className="mb-4">Please request a new password reset link.</p>
          <Link to="/forgot-password">
            <Button variant="outline" size="lg">Request new link</Button>
          </Link>
        </div>
      </AuthShell>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!password || password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      // Token is now in URL, not body
      await fetch(`/api/auth/reset-password/${token!}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to reset password');
        return res.json();
      });
      toast.success("Password has been reset. You can now sign in.");
      navigate({ to: "/login" });
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Reset password" subtitle="Enter your new password below.">
      {userEmail && (
        <p className="text-sm text-muted-foreground text-center mb-4">
          Resetting password for <strong className="font-medium">{userEmail}</strong>
        </p>
      )}
      <form onSubmit={onSubmit} className="space-y-4" data-testid="reset-password-form">
        <div className="space-y-1.5">
          <Label htmlFor="pw">New password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="pw"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="pl-10 pr-10"
              placeholder="At least 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cpw">Confirm password</Label>
          <Input
            id="cpw"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            placeholder="Confirm your new password"
          />
        </div>
        <Button type="submit" className="w-full rounded-full" size="lg" disabled={loading}>
          {loading ? "Resetting..." : <><span>Reset password</span><ArrowRight className="ml-2 h-4 w-4" /></>}
        </Button>
        <p className="pt-2 text-center text-sm text-muted-foreground">
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}