import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { OrbitMark } from "@/components/orbit/orbit-mark";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useStore } from "@/lib/mock-store";
import { toast } from "sonner";

export const Route = createFileRoute("/invite/$token")({
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
  const user = useStore((s) => s.user);
  const navigate = useNavigate();

  function accept() {
    toast.success("Invite accepted");
    navigate({ to: user ? "/app/projects" : "/login" });
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <OrbitMark size={40} />
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight">You're invited to Orbit</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Someone shared workspace <span className="font-mono text-foreground">{token}</span> with you.
        </p>
        <Button size="lg" className="mt-6 w-full rounded-full" onClick={accept}>
          <CheckCircle2 className="mr-2 h-4 w-4" /> Accept invite
        </Button>
        <Link to="/" className="mt-4 inline-block text-xs text-muted-foreground hover:text-foreground">
          Not now, take me home
        </Link>
      </div>
    </div>
  );
}
