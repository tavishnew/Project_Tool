import { useEffect, useState } from 'react';
import Modal from './Modal';
import { api } from '../api';
import type { Invite } from '../types';
import { useToast } from './Toast';

interface InviteModalProps {
  projectId: string;
  onClose: () => void;
  onChanged?: () => void;
}

export default function InviteModal({ projectId, onClose, onChanged }: InviteModalProps) {
  const { notify } = useToast();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [made, setMade] = useState<Invite | null>(null);

  const load = () => {
    api
      .listInvites(projectId)
      .then((r) => setInvites(r.invites))
      .catch((e) => notify(e.message, 'error'));
  };
  useEffect(load, [projectId]);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { invite } = await api.createInvite(projectId, email.trim() || undefined);
      setMade(invite);
      setEmail('');
      load();
      onChanged?.();
      notify('Invite created');
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Could not create invite', 'error');
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (inviteId: string) => {
    try {
      await api.revokeInvite(projectId, inviteId);
      load();
      onChanged?.();
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Revoke failed', 'error');
    }
  };

  const copy = (link: string) => {
    const url = `${window.location.origin}${link}`;
    navigator.clipboard
      ?.writeText(url)
      .then(() => notify('Link copied'), () => notify('Copy failed', 'error'));
  };

  return (
    <Modal title="Invite to project" onClose={onClose}>
      <form onSubmit={generate}>
        <div className="field">
          <label htmlFor="i-email">Teammate email (optional)</label>
          <input
            id="i-email"
            className="input"
            type="email"
            placeholder="teammate@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            Generate invite
          </button>
        </div>
      </form>

      {made && (
        <div className="invite-made">
          <div className="invite-link">{window.location.origin}{made.link}</div>
          <button className="btn btn-ghost" onClick={() => copy(made.link)}>
            Copy link
          </button>
        </div>
      )}

      <h3 style={{ fontSize: 14, margin: '18px 0 8px' }}>Active invites</h3>
      {invites.length === 0 ? (
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>No invites yet.</p>
      ) : (
        <div>
          {invites.map((inv) => (
            <div className="invite-row" key={inv.id}>
              <div className="invite-info">
                <div className="invite-target">{inv.email ?? 'Anyone with the link'}</div>
                <div className="invite-meta">
                  {inv.pending ? 'Pending' : 'Used'} · expires{' '}
                  {new Date(inv.expires_at).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" onClick={() => copy(inv.link)}>
                  Copy
                </button>
                {inv.pending && (
                  <button className="btn btn-danger" onClick={() => revoke(inv.id)}>
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
