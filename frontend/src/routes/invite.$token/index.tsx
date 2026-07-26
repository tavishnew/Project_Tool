import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { OrbitMark } from "@/components/orbit/orbit-mark";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { api } from "@/api";

export const Route = createFileRoute("/invite/$token/")({
  head: () => ({
    meta: [
      { title: "You're invited — Orbit" },
      { name: "description", content: "Accept your invitation to a workspace." },
      { property: "og:title", content: "You're invited — Orbit" },
      { property: "og:description", content: "Accept your invitation to a workspace." },
    ],
  }),
  component: InvitePage,
});

function InvitePage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  async function accept() {
    setLoading(true);
    setError(null);
    try {
      await api.acceptInvite(token);
      setAccepted(true);
      setTimeout(() => navigate({ to: "/app/projects" }), 1500);
    } catch {
      setError("This invite may have expired or is invalid.");
    } finally {
      setLoading(false);
    }
  }

  if (accepted) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-6">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Welcome aboard!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You've joined the workspace. Taking you to your projects...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <OrbitMark size={40} />
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight">You're invited to Orbit</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Someone shared a workspace with you.
        </p>
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            <XCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        <Button
          size="lg"
          className="mt-6 w-full rounded-full"
          onClick={accept}
          disabled={loading}
        >
          {loading ? "Accepting..." : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />Accept invite
            </>
          )}
        </Button>
        <Link
          to="/"
          className="mt-4 inline-block text-xs text-muted-foreground hover:text-foreground"
        >
          Not now, take me home
        </Link>
      </div>
    </div>
  );
}