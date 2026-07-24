import { useState } from 'react';
import Modal from './Modal';
import type { Member, Task, TaskPriority, TaskStatus } from '../types';
import { STATUS_LABELS, PRIORITY_LABELS, STATUS_ORDER } from '../types';

interface TaskModalProps {
  members: Member[];
  task: Task | null; // null = create
  defaultStatus?: TaskStatus;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string;
    assigneeId: string | null;
    priority: TaskPriority;
    dueDate: string | null;
    status: TaskStatus;
  }) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
}

function toDateInput(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 10);
}

export default function TaskModal({ members, task, defaultStatus, onClose, onSave, onDelete }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [assigneeId, setAssigneeId] = useState<string | null>(task?.assignee_id ?? null);
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState<string | null>(toDateInput(task?.due_date ?? null));
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? defaultStatus ?? 'todo');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError('Title is required');
    setBusy(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        assigneeId,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        status,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
      setBusy(false);
    }
  };

  return (
    <Modal title={task ? 'Edit task' : 'New task'} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="t-title">Title</label>
          <input
            id="t-title"
            className="input"
            value={title}
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Write launch copy"
          />
        </div>
        <div className="field">
          <label htmlFor="t-desc">Description</label>
          <textarea
            id="t-desc"
            className="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="t-assignee">Assignee</label>
            <select
              id="t-assignee"
              className="select"
              value={assigneeId ?? ''}
              onChange={(e) => setAssigneeId(e.target.value || null)}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="t-priority">Priority</label>
            <select
              id="t-priority"
              className="select"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="t-status">Status</label>
            <select
              id="t-status"
              className="select"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="t-due">Due date</label>
            <input
              id="t-due"
              type="date"
              className="input"
              value={dueDate ?? ''}
              onChange={(e) => setDueDate(e.target.value || null)}
            />
          </div>
        </div>
        {error && <div className="form-error">{error}</div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          {task && onDelete ? (
            <button
              type="button"
              className="btn btn-danger"
              onClick={async () => {
                setBusy(true);
                try {
                  await onDelete();
                } catch {
                  setBusy(false);
                }
              }}
            >
              Delete
            </button>
          ) : (
            <span />
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {task ? 'Save' : 'Create task'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
