import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/api";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import type { Member, WorkspaceInvite } from "@/types";
import { MemberAvatar, MemberStack } from "@/components/orbit/member-avatar";

export const Route = createFileRoute("/app/members")({
  component: MembersPage,
});

// Extracted: initials avatar for invite rows (repeated pattern)
function InviteAvatar({ email }: { email: string }) {
  return (
    <div className="inline-flex items-center justify-center rounded-full border-2 border-background bg-muted text-muted-foreground font-semibold" style={{ width: 40, height: 40 }}>
      {email[0].toUpperCase()}
    </div>
  );
}

function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<WorkspaceInvite[]>([]);
  const [email, setEmail] = useState("");
  const [loadingInvites, setLoadingInvites] = useState(false);

  useEffect(() => {
    fetchMembers();
    fetchInvites();
  }, []);

  async function fetchMembers() {
    try {
      const data = await api.listMembers();
      setMembers(data.members);
    } catch { toast.error("Failed to load members"); }
  }

  async function fetchInvites() {
    setLoadingInvites(true);
    try {
      const data = await api.listWorkspaceInvites();
      setInvites(data.invites);
    } catch { toast.error("Failed to load invites"); }
    finally { setLoadingInvites(false); }
  }

  async function handleInvite() {
    if (!email) { toast.error("Enter an email"); return; }
    try {
      await api.createWorkspaceInvite(email);
      setEmail("");
      toast.success("Invite sent");
      fetchInvites();
    } catch { toast.error("Failed to invite member"); }
  }

  async function handleCancelInvite(inviteId: string) {
    try {
      await api.cancelWorkspaceInvite(inviteId);
      toast.success("Invite cancelled");
      fetchInvites();
    } catch { toast.error("Failed to cancel invite"); }
  }

  const pendingInvites = invites.filter(i => !i.used_at);
  const expiredInvites = invites.filter(i => i.used_at || new Date(i.expires_at) < new Date());

  return (
    <div className="space-y-8" data-testid="members-page">
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

      {pendingInvites.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Pending Invites</h2>
          <div className="mt-4 space-y-3">
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
                <div className="flex items-center gap-3">
                  <InviteAvatar email={invite.email} />
                  <div>
                    <div className="font-semibold">{invite.email}</div>
                    <div className="text-xs text-muted-foreground">
                      Expires {new Date(invite.expires_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleCancelInvite(invite.id)} aria-label="Cancel invite">
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {expiredInvites.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Expired / Used Invites</h2>
          <div className="mt-4 space-y-3">
            {expiredInvites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between rounded-xl border border-border bg-background p-4 opacity-60">
                <div className="flex items-center gap-3">
                  <InviteAvatar email={invite.email} />
                  <div>
                    <div className="font-semibold">{invite.email}</div>
                    <div className="text-xs text-muted-foreground">
                      {invite.used_at ? `Accepted ${new Date(invite.used_at).toLocaleDateString()}` : `Expired ${new Date(invite.expires_at).toLocaleDateString()}`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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