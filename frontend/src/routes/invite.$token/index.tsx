import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { api } from "@/api";
import { useAuth } from "@/auth";
import { OrbitMark } from "@/components/orbit/orbit-mark";
import { Button } from "@/components/ui/button";
import type { ProjectInvitationPreview } from "@/types";

export const Route = createFileRoute("/invite/$token/")({
  head: () => ({
    meta: [
      { title: "Project invitation — Orbit" },
      { name: "description", content: "Accept your invitation to collaborate on an Orbit project." },
    ],
  }),
  component: InvitePage,
});

function InvitePage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invitation, setInvitation] = useState<ProjectInvitationPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void api.getProjectInvitation(token)
      .then((result) => {
        if (active) setInvitation(result.invitation);
      })
      .catch((requestError) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "This invitation is invalid or has expired.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [token]);

  async function accept() {
    setAccepting(true);
    setError(null);
    try {
      const result = await api.acceptProjectInvitation(token);
      window.localStorage.removeItem("pendingProjectInvite");
      setAccepted(true);
      window.setTimeout(() => navigate({ to: "/app/projects/$id", params: { id: result.projectId } }), 1200);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "This invitation could not be accepted.");
    } finally {
      setAccepting(false);
    }
  }

  function rememberInvitation() {
    window.localStorage.setItem("pendingProjectInvite", token);
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <OrbitMark size={40} />
        </div>

        {loading ? (
          <div className="py-8 text-sm text-muted-foreground"><Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" />Checking your invitation…</div>
        ) : accepted ? (
          <>
            <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-green-600" />
            <h1 className="font-display text-2xl font-bold tracking-tight">You are in</h1>
            <p className="mt-2 text-sm text-muted-foreground">Taking you to the project…</p>
          </>
        ) : error ? (
          <>
            <XCircle className="mx-auto mb-4 h-10 w-10 text-destructive" />
            <h1 className="font-display text-2xl font-bold tracking-tight">Invitation unavailable</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          </>
        ) : invitation ? (
          <>
            <h1 className="font-display text-2xl font-bold tracking-tight">Join {invitation.projectName}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              You have been invited as a {invitation.role === "admin" ? "project administrator" : "project member"}.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">This invitation is for {invitation.email}.</p>

            {user ? (
              <Button size="lg" className="mt-6 w-full rounded-full" onClick={() => void accept()} disabled={accepting}>
                {accepting ? "Accepting…" : <><CheckCircle2 className="mr-2 h-4 w-4" />Accept invitation</>}
              </Button>
            ) : (
              <div className="mt-6 space-y-3">
                <Link to="/login" onClick={rememberInvitation} className="block">
                  <Button size="lg" className="w-full rounded-full"><ShieldCheck className="mr-2 h-4 w-4" />Sign in to accept</Button>
                </Link>
                <Link to="/register" onClick={rememberInvitation} className="block">
                  <Button size="lg" variant="outline" className="w-full rounded-full">Create an account</Button>
                </Link>
              </div>
            )}
          </>
        ) : null}

        <Link to="/" className="mt-6 inline-block text-xs text-muted-foreground hover:text-foreground">Not now, take me home</Link>
      </div>
    </div>
  );
}
