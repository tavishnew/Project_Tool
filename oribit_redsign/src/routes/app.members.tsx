import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/mock-store";
import { MemberAvatar } from "@/components/orbit/member-avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/members")({
  head: () => ({
    meta: [
      { title: "Members — Orbit" },
      { name: "description", content: "The people in your Orbit workspace." },
      { property: "og:title", content: "Members — Orbit" },
      { property: "og:description", content: "The people in your Orbit workspace." },
    ],
  }),
  component: MembersPage,
});

function MembersPage() {
  const members = useStore((s) => s.members);
  const invite = useStore((s) => s.inviteMember);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  function handle() {
    if (!name || !email) return;
    const m = invite(email, name);
    setName("");
    setEmail("");
    toast.success(`${m.name} added to workspace`);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">Members</h1>
        <p className="mt-1 text-sm text-muted-foreground">Everyone who can log into this workspace.</p>
      </header>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold">Invite someone new</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button onClick={handle}><UserPlus className="mr-2 h-4 w-4" /> Invite</Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {members.map((m) => (
          <div key={m.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <MemberAvatar member={m} size={40} />
              <div>
                <div className="font-semibold">{m.name}</div>
                <div className="text-xs text-muted-foreground">{m.email}</div>
              </div>
            </div>
            <Badge variant="secondary" className="capitalize">{m.role}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
