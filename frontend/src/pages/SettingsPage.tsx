import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import type { Project } from '../types';
import { useAuth } from '../auth';
import InviteModal from '../components/InviteModal';
import { useToast } from '../components/Toast';

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
        <Link to="/projects" className="btn btn-ghost">← Projects</Link>
        <h1 className="page-title" style={{ fontSize: 22 }}>Settings</h1>
        <div style={{ marginLeft: 'auto' }}>
          <div className="seg">
            <NavLink to={`/projects/${id}`} end className={({ isActive }) => (isActive ? 'active' : '')}>Board</NavLink>
            <NavLink to={`/projects/${id}/list`} className={({ isActive }) => (isActive ? 'active' : '')}>List</NavLink>
            <NavLink to={`/projects/${id}/settings`} className={({ isActive }) => (isActive ? 'active' : '')}>Settings</NavLink>
          </div>
        </div>
      </div>

      <section style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 22, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, marginBottom: 16 }}>Project details</h2>
        <form onSubmit={saveDetails}>
          <div className="field">
            <label htmlFor="s-name">Name</label>
            <input id="s-name" className="input" value={name} disabled={!isOwner} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="s-desc">Description</label>
            <textarea id="s-desc" className="textarea" value={description} disabled={!isOwner} onChange={(e) => setDescription(e.target.value)} />
          </div>
          {isOwner && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={busy}>Save changes</button>
            </div>
          )}
        </form>
      </section>

      <section style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 22, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, marginBottom: 16 }}>Members ({project?.members?.length ?? 0})</h2>
        {project?.members?.map((m) => (
          <div className="member-row" key={m.id}>
            <div className="member-info">
              <div className="member-name">{m.name}</div>
              <div className="member-email">{m.email}</div>
            </div>
            {m.isOwner && <span className="owner-tag">Owner</span>}
            {canManage && !m.isOwner && (
              <button className="btn btn-danger" onClick={() => removeMember(m.id)}>Remove</button>
            )}
          </div>
        ))}
        {canManage && (
          <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary" onClick={() => setShowInvite(true)}>
              Invite link
            </button>
            <form onSubmit={addMember} style={{ display: 'flex', gap: 10, flex: 1, minWidth: 240 }}>
              <input
                className="input"
                type="email"
                placeholder="Registered teammate's email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="btn btn-ghost" disabled={busy}>Add</button>
            </form>
          </div>
        )}
        {canManage && (
          <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 8 }}>
            Share an invite link (or email) — teammates can join even before registering.
          </p>
        )}
      </section>
      {canManage && showInvite && (
        <InviteModal projectId={id} onClose={() => setShowInvite(false)} onChanged={load} />
      )}

      {canManage && (
        <section style={{ background: 'var(--surface)', border: '1px solid #f3cfc4', borderRadius: 'var(--radius)', padding: 22 }}>
          <h2 style={{ fontSize: 16, marginBottom: 8, color: 'var(--overdue)' }}>Danger zone</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 12 }}>
            Deleting a project removes all of its tasks permanently.
          </p>
          <button className="btn btn-danger" onClick={deleteProject}>Delete project</button>
        </section>
      )}
    </div>
  );
}

