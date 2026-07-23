import type { Task, TaskPriority } from '../../types';
import { PRIORITY_LABELS } from '../../types';
import { isOverdue, formatDue } from '../../status';
import { Badge } from '../../components/ui/Badge';

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <Badge variant="secondary">{PRIORITY_LABELS[priority]}</Badge>;
}

export function OverdueBadge({ dueDate, status }: { dueDate: string | null; status: Task['status'] }) {
  if (!isOverdue(dueDate, status)) return null;
  return <Badge variant="destructive">Overdue</Badge>;
}

export function DueLabel({ dueDate, status }: { dueDate: string | null; status: Task['status'] }) {
  const text = formatDue(dueDate);
  if (!text) return null;
  const overdue = isOverdue(dueDate, status);
  return (
    <span className={overdue ? "text-destructive" : "text-muted-foreground"}>
      {text}
    </span>
  );
}