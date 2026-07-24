import { cn } from "@/lib/utils";
import { TaskPriority } from "@/types";

const priorityLabels: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const priorityStyles: Record<TaskPriority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-info/10 text-info",
  high: "bg-warning/15 text-warning",
  urgent: "bg-primary/10 text-primary",
};

export function PriorityBadge({ value, className }: { value: TaskPriority; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
        priorityStyles[value],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {priorityLabels[value]}
    </span>
  );
}