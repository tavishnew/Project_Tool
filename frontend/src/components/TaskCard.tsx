import { useState } from "react";
import type { Member, Task } from "../types";
import { STATUS_COLOR } from "../status";
import { PriorityBadge } from "@/components/orbit/PriorityBadge";
import { StatusPill } from "@/components/orbit/StatusPill";
import { OverdueBadge, DueLabel } from "../components/Badges";

interface TaskCardProps {
  task: Task;
  assignee?: Member | null;
  onClick: () => void;
}

function miniInitials(name: string) {
  const p = name.trim().split(/\s+/);
  return (p[0][0] + (p[1]?.[0] ?? "")).toUpperCase();
}

export default function TaskCard({ task, assignee, onClick }: TaskCardProps) {
  const [dragging, setDragging] = useState(false);
  const done = task.status === "done";

  return (
    <div
      className={`task-card ${dragging ? "dragging" : ""}`}
      draggable
      onClick={onClick}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", task.id);
        e.dataTransfer.effectAllowed = "move";
        setDragging(true);
      }}
      onDragEnd={() => setDragging(false)}
    >
      <div className="task-top">
        <span
          className={`status-dot ${done ? "filled" : ""}`}
          style={{ ["--col" as string]: STATUS_COLOR[task.status] }}
        />
        <span
          className="task-title"
          style={done ? { textDecoration: "line-through", color: "var(--muted)" } : undefined}
        >
          {task.title}
        </span>
      </div>
      <div className="task-meta">
        <PriorityBadge value={task.priority} />
        <DueLabel dueDate={task.due_date} status={task.status} />
        <OverdueBadge dueDate={task.due_date} status={task.status} />
        <span style={{ marginLeft: "auto" }}>
          {assignee ? (
            <span className="avatar" title={assignee.name} style={{ width: 24, height: 24, fontSize: 10, margin: 0 }}>
              {miniInitials(assignee.name)}
            </span>
          ) : (
            <span className="task-due">Unassigned</span>
          )}
        </span>
      </div>
    </div>
  );
}