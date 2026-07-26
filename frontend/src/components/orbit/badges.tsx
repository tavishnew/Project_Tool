import { cn } from "@/lib/utils";
import type { TaskPriority as Priority, TaskStatus as Status } from "@/types";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/types";

const priorityStyles: Record<Priority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-info/10 text-info",
  high: "bg-warning/15 text-warning",
  urgent: "bg-primary/10 text-primary",
};

const statusStyles: Record<Status, string> = {
  todo: "bg-muted text-muted-foreground",
  in_progress: "bg-info/10 text-info",
  review: "bg-warning/15 text-warning",
  done: "bg-success/15 text-success",
};

export function PriorityBadge({ value }: { value: Priority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
        priorityStyles[value],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {PRIORITY_LABELS[value]}
    </span>
  );
}

export function StatusPill({ value }: { value: Status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        statusStyles[value],
      )}
    >
      {STATUS_LABELS[value]}
    </span>
  );
}