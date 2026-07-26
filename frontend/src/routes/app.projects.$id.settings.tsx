import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { api } from "@/api";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/types";

export const Route = createFileRoute("/app/projects/$id/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [members, setMembers] = useState<{ id: string; name: string; email: string; role?: string; isOwner?: boolean }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchProject(); }, [id]);

  async function fetchProject() {
    try {
      const data = await api.getProject(id);
      setProject(data.project);
      setName(data.project.name);
      setDesc(data.project.description || "");
      if (data.project.members) setMembers(data.project.members);
    } catch { toast.error("Failed to load project"); }
  }

  async function save() {
    setSaving(true);
    try {
      await api.updateProject(id, { name, description: desc });
      toast.success("Project updated");
    } catch { toast.error("Failed to save"); } finally { setSaving(false); }
  }

  async function handleInvite() {
    if (!inviteEmail) { toast.error("Enter an email"); return; }
    try {
      await api.addProjectMember(id, inviteEmail);
      setInviteEmail("");
      toast.success("Member invited");
      fetchProject();
    } catch { toast.error("Failed to invite"); }
  }

  async function removeMember(memberId: string) {
    try {
      await api.removeProjectMember(id, memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      toast.success("Member removed");
    } catch { toast.error("Failed to remove member"); }
  }

  async function handleDelete() {
    try {
      await api.deleteProject(id);
      toast.success("Project deleted");
      navigate({ to: "/app/projects" });
    } catch { toast.error("Failed to delete project"); }
  }

  if (!project) return <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">Loading...</div>;

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
            <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="members" className="mt-6 space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-lg font-semibold">Invite teammates</h3>
          <p className="mt-1 text-sm text-muted-foreground">They'll be added to this project instantly.</p>
          <div className="mt-4 flex gap-3">
            <Input placeholder="Email" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="max-w-xs" />
            <Button onClick={handleInvite}><UserPlus className="mr-2 h-4 w-4" /> Invite</Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between border-b border-border p-4 last:border-b-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">{m.name[0]}</div>
                <div>
                  <div className="text-sm font-semibold">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="capitalize">{m.isOwner ? "Owner" : m.role || "Member"}</Badge>
                {!m.isOwner && (
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
          <p className="mt-1 text-sm text-muted-foreground">This will permanently remove the project and all its tasks. This action can't be undone.</p>
          <Button variant="destructive" className="mt-4" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete this project
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}