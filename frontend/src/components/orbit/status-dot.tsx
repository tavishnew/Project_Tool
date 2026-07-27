import { cn } from "@/lib/utils";
import { STATUS_LABELS, type TaskStatus } from "@/types";

const STATUS_DOT: Record<TaskStatus, string> = {
  todo: "bg-muted-foreground",
  in_progress: "bg-info",
  review: "bg-warning",
  done: "bg-success",
};

export function StatusDot({ status, className }: { status: TaskStatus; className?: string }) {
  return (
    <span className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_DOT[status], className)}>
      <span className="sr-only">Status: {STATUS_LABELS[status]}</span>
    </span>
  );
}
