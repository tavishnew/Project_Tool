import { cn } from "@/lib/utils";
import { TaskStatus } from "@/types";

const statusLabels: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "In Review",
  done: "Done",
};

const statusStyles: Record<TaskStatus, string> = {
  todo: "bg-muted text-muted-foreground",
  in_progress: "bg-info/10 text-info",
  review: "bg-warning/15 text-warning",
  done: "bg-success/15 text-success",
};

export function StatusPill({ value, className }: { value: TaskStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        statusStyles[value],
        className,
      )}
    >
      {statusLabels[value]}
    </span>
  );
}