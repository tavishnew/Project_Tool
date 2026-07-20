import type { Task, TaskStatus } from "../types";
import type { CSSProperties } from "react";
import StatusBadge from "./ui/StatusBadge";

const PRIORITY_COLOR: Record<Task["priority"], string> = {
  high: "bg-brick",
  medium: "bg-gold",
  low: "bg-pine",
};

const PRIORITY_LABEL: Record<Task["priority"], string> = {
  high: "High",
  medium: "Med",
  low: "Low",
};

const NEXT_STATUS: Record<TaskStatus, TaskStatus | null> = {
  todo: "in_progress",
  in_progress: "done",
  done: null,
};

const NEXT_LABEL: Record<TaskStatus, string> = {
  todo: "Start →",
  in_progress: "Finish →",
  done: "",
};

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function TaskCard({
  task,
  index,
  onOpen,
  onAdvance,
  onDelete,
}: {
  task: Task;
  index: number;
  onOpen: () => void;
  onAdvance: () => void;
  onDelete: () => void;
}) {
  const due = formatDate(task.due_date);
  const overdue =
    task.due_date && task.status !== "done" && new Date(task.due_date) < new Date(new Date().toDateString());

  return (
    <div
      className="tick-frame group relative flex gap-3 rounded-sm border border-line bg-surface py-3 pl-0 pr-3 shadow-card transition hover:border-ink/30 hover:shadow-pop"
      style={{ "--tick": "#E4E1DA" } as CSSProperties}
    >
      <div className={`w-1 shrink-0 rounded-l-sm ${PRIORITY_COLOR[task.priority]}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <button
            onClick={onOpen}
            className="text-left font-sans text-[0.925rem] font-medium leading-snug text-ink hover:underline underline-offset-2 focus-ring rounded-sm"
          >
            {task.title}
          </button>
          <button
            onClick={onDelete}
            aria-label="Delete task"
            className="shrink-0 rounded-sm px-0.5 text-muted opacity-0 transition group-hover:opacity-100 hover:text-brick focus-ring active:translate-y-px"
          >
            ×
          </button>
        </div>

        {task.description && (
          <p className="mt-1 line-clamp-2 text-[0.8rem] leading-snug text-muted">{task.description}</p>
        )}

        <div className="mt-2.5 flex items-center justify-between gap-2 text-[0.7rem]">
          <div className="flex items-center gap-2">
            <StatusBadge status={task.status} />
            <span className="font-mono text-muted tabular-nums">#{String(index + 1).padStart(2, "0")}</span>
            <span className="text-line">·</span>
            <span className={overdue ? "font-medium text-brick" : "text-muted"}>{due ? due : "no due date"}</span>
            <span className="text-line">·</span>
            <span className="uppercase tracking-wide text-muted">{PRIORITY_LABEL[task.priority]}</span>
          </div>
          {NEXT_STATUS[task.status] && (
            <button
              onClick={onAdvance}
              className="font-mono text-[0.7rem] text-pine opacity-0 transition group-hover:opacity-100 hover:text-pine-dark focus-ring rounded-sm active:translate-y-px"
            >
              {NEXT_LABEL[task.status]}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
