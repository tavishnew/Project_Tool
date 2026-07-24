import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/api";
import type { Member } from "@/types";
import { MemberAvatar } from "@/components/orbit/MemberAvatar";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { UserPlus, Mail } from "lucide-react";
import { useToast } from "@/components/Toast";
import { useStore, addMember } from "@/lib/mock-store";

export default function MembersPage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const store = useStore();
  const [members, setMembers] = useState<Member[]>(store.members);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  // No need to fetch from API; we use the mock store as source of truth for workspace members.
  // If you want to sync with server, you would need an endpoint for workspace members.

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setBusy(true);
    try {
      const newMember: Member = {
        id: Math.random().toString(36).slice(2, 10),
        name: name.trim(),
        email: email.trim(),
        avatarUrl: null,
        isOwner: false,
        color: ["#ff5a4e", "#f59e0b", "#10b981", "#6366f1", "#ec4899", "#06b6d4"][Math.floor(Math.random() * 6)],
      };
      addMember(newMember);
      setMembers((prev) => [...prev, newMember]);
      setName("");
      setEmail("");
      notify(`${newMember.name} invited to workspace`);
    } catch (err) {
      notify("Failed to invite member", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleCreateInviteLink = async () => {
    try {
      const link = `${window.location.origin}/invite/${Math.random().toString(36).slice(2, 20)}`;
      setInviteLink(link);
      await navigator.clipboard.writeText(link);
      notify("Invite link copied to clipboard!");
    } catch {
      notify("Failed to create invite link", "error");
    }
  };

  if (false) {
    // keep loading state false
    return <div className="page-loading">Loading membersâ€¦</div>;
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">Members</h1>
        <p className="mt-1 text-sm text-muted-foreground">Everyone who can log into this workspace.</p>
      </header>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold">Invite someone new</h2>
        <form onSubmit={handleInvite} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" disabled={busy}><UserPlus className="mr-2 h-4 w-4" /> Invite</Button>
        </form>
        {inviteLink && (
          <div className="mt-4 p-3 bg-primary-soft border border-primary rounded-lg text-sm">
            <div className="flex items-center justify-between">
              <span>Invite link created: <code>{inviteLink}</code></span>
              <Button variant="ghost" size="sm" onClick={() => setInviteLink(null)}>Dismiss</Button>
            </div>
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={handleCreateInviteLink} disabled={busy}><Mail className="mr-2 h-4 w-4" /> Create invite link</Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {members.map((m) => {
          const memberWithColor = { ...m, color: m.color ?? "#6366f1" };
          return (
            <div key={m.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <MemberAvatar member={memberWithColor} size={40} />
                <div>
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.email}</div>
                </div>
              </div>
              <Badge variant="secondary" className="capitalize">{m.isOwner ? "owner" : "member"}</Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
