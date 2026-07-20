import type { Task, TaskStatus } from "../types";
import TaskCard from "./TaskCard";
import Skeleton from "./ui/Skeleton";

const LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export default function Column({
  status,
  tasks,
  onOpenTask,
  onAdvanceTask,
  onDeleteTask,
  onAddTask,
}: {
  status: TaskStatus;
  tasks: Task[];
  onOpenTask: (t: Task) => void;
  onAdvanceTask: (t: Task) => void;
  onDeleteTask: (t: Task) => void;
  onAddTask: () => void;
}) {
  return (
    <div className="flex min-w-[280px] flex-1 flex-col">
      <div className="mb-3 flex items-baseline justify-between border-b border-ink/80 pb-2">
        <h2 className="font-display text-[1.05rem] font-medium text-ink">{LABELS[status]}</h2>
        <span className="font-mono text-xs text-muted tabular-nums">{tasks.length}</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {tasks.map((t, i) => (
          <div
            key={t.id}
            className="opacity-0 animate-[fadeUp_0.4s_ease_forwards]"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <TaskCard
              task={t}
              index={i}
              onOpen={() => onOpenTask(t)}
              onAdvance={() => onAdvanceTask(t)}
              onDelete={() => onDeleteTask(t)}
            />
          </div>
        ))}

        {tasks.length === 0 && (
          <p className="tick-frame rounded-sm border border-dashed border-line px-3 py-4 text-center text-xs text-muted">
            Nothing here yet.
          </p>
        )}

        {status === "todo" && (
          <button
            onClick={onAddTask}
            className="tick-frame mt-1 rounded-sm border border-dashed border-line px-3 py-2 text-left text-sm text-muted transition hover:border-pine hover:text-pine focus-ring"
          >
            + Add task
          </button>
        )}
      </div>
    </div>
  );
}
