import { cn } from "@/lib/utils";

type Status = "todo" | "in_progress" | "done";

const statusLabels: Record<Status, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

const statusStyles: Record<Status, string> = {
  todo: "bg-muted text-muted-foreground",
  in_progress: "bg-info/10 text-info",
  done: "bg-success/15 text-success",
};

export function StatusPill({ value, className }: { value: Status; className?: string }) {
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