import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/mock-store";
import { MemberAvatar } from "@/components/orbit/member-avatar";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/projects/$id/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { id } = Route.useParams();
  const project = useStore((s) => s.projects.find((p) => p.id === id));
  const members = useStore((s) => s.members);
  const update = useStore((s) => s.updateProject);
  const del = useStore((s) => s.deleteProject);
  const invite = useStore((s) => s.inviteMember);
  const navigate = useNavigate();

  const [name, setName] = useState(project?.name ?? "");
  const [desc, setDesc] = useState(project?.description ?? "");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");

  if (!project) return null;
  const projectMembers = members.filter((m) => project.memberIds.includes(m.id));

  function save() {
    update(id, { name, description: desc });
    toast.success("Project updated");
  }

  function handleInvite() {
    if (!inviteEmail || !inviteName) return;
    const m = invite(inviteEmail, inviteName);
    update(id, { memberIds: [...project!.memberIds, m.id] });
    setInviteEmail("");
    setInviteName("");
    toast.success(`Invited ${m.name}`);
  }

  function removeMember(mid: string) {
    update(id, { memberIds: project!.memberIds.filter((x) => x !== mid) });
  }

  function handleDelete() {
    del(id);
    navigate({ to: "/app/projects" });
  }

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="rounded-full">
        <TabsTrigger value="general" className="rounded-full">General</TabsTrigger>
        <TabsTrigger value="members" className="rounded-full">Members</TabsTrigger>
        <TabsTrigger value="danger" className="rounded-full">Danger zone</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="mt-6">
        <div className="max-w-xl space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="space-y-1.5">
            <Label>Project name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} />
          </div>
          <div className="flex justify-end">
            <Button onClick={save}>Save changes</Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="members" className="mt-6 space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-lg font-semibold">Invite teammates</h3>
          <p className="mt-1 text-sm text-muted-foreground">They'll be added to this project instantly.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <Input placeholder="Name" value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
            <Input placeholder="Email" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            <Button onClick={handleInvite}><UserPlus className="mr-2 h-4 w-4" /> Invite</Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card">
          {projectMembers.map((m) => (
            <div key={m.id} className="flex items-center justify-between border-b border-border p-4 last:border-b-0">
              <div className="flex items-center gap-3">
                <MemberAvatar member={m} size={36} />
                <div>
                  <div className="text-sm font-semibold">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="capitalize">{m.role}</Badge>
                {m.role !== "owner" && (
                  <Button size="icon" variant="ghost" onClick={() => removeMember(m.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="danger" className="mt-6">
        <div className="max-w-xl rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
          <h3 className="font-display text-lg font-semibold text-destructive">Delete project</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            This will permanently remove the project and all its tasks. This action can't be undone.
          </p>
          <Button variant="destructive" className="mt-4" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete this project
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}
