import { useState } from 'react';
import Modal from './Modal';

interface ProjectModalProps {
  onClose: () => void;
  onCreate: (name: string, description: string) => Promise<void> | void;
}

export default function ProjectModal({ onClose, onCreate }: ProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Name is required');
    setBusy(true);
    try {
      await onCreate(name.trim(), description.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      setBusy(false);
    }
  };

  return (
    <Modal title="New project" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="p-name">Name</label>
          <input
            id="p-name"
            className="input"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            placeholder="Q3 Product Launch"
          />
        </div>
        <div className="field">
          <label htmlFor="p-desc">Description</label>
          <textarea
            id="p-desc"
            className="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this project about?"
          />
        </div>
        {error && <div className="form-error">{error}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            Create project
          </button>
        </div>
      </form>
    </Modal>
  );
}
