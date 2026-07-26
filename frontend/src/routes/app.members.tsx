import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/api";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import type { Member } from "@/types";
import { MemberAvatar } from "@/components/orbit/member-avatar";

export const Route = createFileRoute("/app/members")({
  component: MembersPage,
});

function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState("");

  useEffect(() => { fetchMembers(); }, []);

  async function fetchMembers() {
    try {
      const data = await api.listMembers();
      setMembers(data.members);
    } catch { toast.error("Failed to load members"); }
  }

  async function handleInvite() {
    if (!email) { toast.error("Enter an email"); return; }
    try {
      await api.addMember(email);
      setEmail("");
      toast.success("Invite sent");
      fetchMembers();
    } catch { toast.error("Failed to invite member"); }
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">Members</h1>
        <p className="mt-1 text-sm text-muted-foreground">Everyone who can log into this workspace.</p>
      </header>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold">Invite someone new</h2>
        <div className="mt-4 flex gap-3">
          <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="max-w-xs" />
          <Button onClick={handleInvite}><UserPlus className="mr-2 h-4 w-4" /> Invite</Button>
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
            <Badge variant="secondary" className="capitalize">{m.isOwner ? "Owner" : "Member"}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}