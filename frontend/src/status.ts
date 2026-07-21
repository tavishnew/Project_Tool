import type { TaskStatus } from './types';

export const STATUS_COLOR: Record<TaskStatus, string> = {
  todo: 'var(--todo)',
  in_progress: 'var(--progress)',
  done: 'var(--done)',
};

export function isOverdue(dueDate: string | null, status: TaskStatus): boolean {
  if (!dueDate || status === 'done') return false;
  return new Date(dueDate).getTime() < Date.now();
}

export function formatDue(dueDate: string | null): string | null {
  if (!dueDate) return null;
  const d = new Date(dueDate);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
