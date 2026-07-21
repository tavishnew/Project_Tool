import type { Task, TaskPriority } from '../types';
import { PRIORITY_LABELS } from '../types';
import { isOverdue, formatDue } from '../status';

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <span className={`badge badge-priority-${priority}`}>{PRIORITY_LABELS[priority]}</span>;
}

export function OverdueBadge({ dueDate, status }: { dueDate: string | null; status: Task['status'] }) {
  if (!isOverdue(dueDate, status)) return null;
  return <span className="badge badge-overdue">Overdue</span>;
}

export function DueLabel({ dueDate, status }: { dueDate: string | null; status: Task['status'] }) {
  const text = formatDue(dueDate);
  if (!text) return null;
  const overdue = isOverdue(dueDate, status);
  return <span className="task-due" style={overdue ? { color: 'var(--overdue)' } : undefined}>{text}</span>;
}
