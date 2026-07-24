import { cn } from "@/lib/utils";

type Priority = "low" | "medium" | "high";

const priorityLabels: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const priorityStyles: Record<Priority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-info/10 text-info",
  high: "bg-warning/15 text-warning",
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
      {priorityLabels[value]}
    </span>
  );
}