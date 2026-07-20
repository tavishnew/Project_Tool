import { useState } from "react";
import type { Task, TaskPriority, TaskStatus } from "../types";

export default function TaskModal({
  task,
  onClose,
  onSave,
}: {
  task: Task | null;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date: string | null;
  }) => void;
}) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "todo");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "medium");
  const [dueDate, setDueDate] = useState(task?.due_date ? task.due_date.slice(0, 10) : "");

  const canSave = title.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-[2px] p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-sm border border-line bg-surface p-6 shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-1 font-mono text-[0.7rem] uppercase tracking-wide text-muted">
          {task ? "Edit entry" : "New entry"}
        </p>
        <h2 className="mb-5 font-display text-xl font-medium text-ink">
          {task ? "Edit task" : "Add a task"}
        </h2>

        <label className="mb-1 block text-xs font-medium text-muted">Title</label>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          className="mb-4 w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus-ring"
        />

        <label className="mb-1 block text-xs font-medium text-muted">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional detail"
          rows={3}
          className="mb-4 w-full resize-none rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus-ring"
        />

        <div className="mb-5 grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full rounded-sm border border-line bg-paper px-2 py-2 text-sm text-ink outline-none focus-ring"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full rounded-sm border border-line bg-paper px-2 py-2 text-sm text-ink outline-none focus-ring"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Due</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-sm border border-line bg-paper px-2 py-2 text-sm text-ink outline-none focus-ring"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-sm px-3 py-2 text-sm text-muted transition hover:text-ink focus-ring active:translate-y-px"
          >
            Cancel
          </button>
          <button
            disabled={!canSave}
            onClick={() =>
              onSave({
                title: title.trim(),
                description: description.trim(),
                status,
                priority,
                due_date: dueDate ? new Date(dueDate).toISOString() : null,
              })
            }
            className="rounded-sm bg-pine px-4 py-2 text-sm font-medium text-paper transition hover:bg-pine-dark disabled:cursor-not-allowed disabled:opacity-40 focus-ring active:translate-y-px"
          >
            {task ? "Save changes" : "Add task"}
          </button>
        </div>
      </div>
    </div>
  );
}
