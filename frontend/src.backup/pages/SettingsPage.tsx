import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import { api } from '@/api';
import type { Project, Member } from '@/types';
import { useAuth } from '@/auth';
import InviteModal from '@/components/InviteModal';
import { useToast } from '@/components/Toast';
import { MemberAvatar } from '@/components/orbit/MemberAvatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .getProject(id)
      .then((r) => {
        setProject(r.project);
        setName(r.project.name);
        setDescription(r.project.description);
      })
      .catch((e) => notify(e.message, 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  const isOwner = project?.is_owner;
  const canManage = !!isOwner;

  const saveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      await api.updateProject(id, { name: name.trim(), description: description.trim() });
      notify('Project updated');
      load();
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Update failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    try {
      await api.addMember(id, email.trim());
      notify('Member added');
      setEmail('');
      load();
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Could not add member', 'error');
    } finally {
      setBusy(false);
    }
  };

  const removeMember = async (userId: string) => {
    try {
      await api.removeMember(id, userId);
      notify('Member removed');
      load();
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Remove failed', 'error');
    }
  };

  const deleteProject = async () => {
    if (!confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    try {
      await api.deleteProject(id);
      notify('Project deleted');
      navigate('/projects');
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Delete failed', 'error');
    }
  };

  if (loading) return <div className="page-loading">Loading…</div>;

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="board-toolbar">
        <Link to="/projects" className="btn btn-ghost">
          ← Projects
        </Link>
        <h1 className="page-title" style={{ fontSize: 22 }}>
          Settings
        </h1>
        <div style={{ marginLeft: 'auto' }}>
          <div className="seg">
            <NavLink to={`/projects/${id}`} end className={({ isActive }) => (isActive ? 'active' : '')}>
              Board
            </NavLink>
            <NavLink to={`/projects/${id}/list`} className={({ isActive }) => (isActive ? 'active' : '')}>
              List
            </NavLink>
            <NavLink to={`/projects/${id}/settings`} className={({ isActive }) => (isActive ? 'active' : '')}>
              Settings
            </NavLink>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 mb-8">
        <h2 className="font-display text-lg font-semibold mb-4">Project details</h2>
        <form onSubmit={saveDetails} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="s-name">Name</Label>
            <Input id="s-name" className="max-w-md" value={name} disabled={!isOwner} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-desc">Description</Label>
            <Textarea id="s-desc" className="max-w-md" value={description} disabled={!isOwner} onChange={(e) => setDescription(e.target.value)} />
          </div>
          {isOwner && (
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={busy}>Save changes</Button>
            </div>
          )}
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 mb-8">
        <h2 className="font-display text-lg font-semibold mb-4">
          Members ({project?.members?.length ?? 0})
        </h2>
        {project?.members?.map((m) => (
          <div key={m.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
            <div className="flex items-center gap-3">
              <MemberAvatar member={{ ...m, color: m.color ?? '#6366f1' }} size={32} />
              <div>
                <div className="font-semibold">{m.name}</div>
                <div className="text-xs text-muted-foreground">{m.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {m.isOwner && <Badge variant="secondary" className="text-xs">Owner</Badge>}
              {canManage && !m.isOwner && (
                <Button variant="destructive" size="sm" onClick={() => removeMember(m.id)}>Remove</Button>
              )}
            </div>
          </div>
        ))}
        {canManage && (
          <div className="flex flex-wrap gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowInvite(true)}>
              <span className="mr-2">+</span>Invite link
            </Button>
            <form onSubmit={addMember} className="flex gap-2 flex-1 min-w-[240px]">
              <Input
                type="email"
                placeholder="Registered teammate's email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 min-w-0"
              />
              <Button type="submit" disabled={busy}>
                Add
              </Button>
            </form>
          </div>
        )}
        {canManage && (
          <p className="text-xs text-muted-foreground mt-2">
            Share an invite link (or email) — teammates can join even before registering.
          </p>
        )}
      </section>
      {canManage && showInvite && (
        <InviteModal projectId={id} onClose={() => setShowInvite(false)} onChanged={load} />
      )}

      {canManage && (
        <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
          <h2 className="font-display text-lg font-semibold mb-2 text-destructive">Danger zone</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Deleting a project removes all of its tasks permanently.
          </p>
          <Button variant="destructive" onClick={deleteProject}>
            Delete project
          </Button>
        </section>
      )}
    </div>
  );
}




