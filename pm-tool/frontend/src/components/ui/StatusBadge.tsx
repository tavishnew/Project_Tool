import type { TaskStatus } from "../../types";

const TONE: Record<TaskStatus, { label: string; cls: string }> = {
  todo: { label: "TODO", cls: "border-line text-muted" },
  in_progress: { label: "IN PROG", cls: "border-pine/40 text-pine" },
  done: { label: "DONE", cls: "border-pine/40 text-pine" },
};

export default function StatusBadge({ status }: { status: TaskStatus }) {
  const t = TONE[status];
  return (
    <span
      className={`tick-frame inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-wide ${t.cls}`}
      aria-label={`Status: ${t.label}`}
    >
      {t.label}
    </span>
  );
}
