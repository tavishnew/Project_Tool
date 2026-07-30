import { cn } from "@/lib/utils";
import { Plus, CheckCircle2, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KanbanTaskCard } from "./kanban-task-card";
import { StatusPill } from "./badges";
import type { Task, TaskStatus } from "@/types";

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  projectColorMap: Map<string, string>;
  projectNameMap: Map<string, string>;
  assigneeMap: Map<string, { id: string; name: string }>;
  dragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onOpenTask: (task: Task) => void;
  onDragStart: (e: React.DragEvent, taskId: string, projectId: string) => void;
  onUpdate: (taskId: string, data: Partial<Task>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onAddTask: (status: TaskStatus) => void;
  addingIn: TaskStatus | null;
  newTitle: string;
  setNewTitle: (title: string) => void;
  setAddingIn: (status: TaskStatus | null) => void;
  projectId: string;
}

const statusConfig: Record<TaskStatus, { label: string; icon: React.ReactNode; dot: string }> = {
  todo: { label: "Backlog", icon: <FileText className="h-3.5 w-3.5" />, dot: "bg-muted-foreground/40" },
  in_progress: { label: "In Progress", icon: <Clock className="h-3.5 w-3.5" />, dot: "bg-info" },
  review: { label: "In Review", icon: <CheckCircle2 className="h-3.5 w-3.5" />, dot: "bg-warning" },
  done: { label: "Done", icon: <CheckCircle2 className="h-3.5 w-3.5" />, dot: "bg-success" },
};

export function KanbanColumn({
  status,
  tasks,
  projectColorMap,
  projectNameMap,
  assigneeMap,
  dragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onOpenTask,
  onDragStart,
  onUpdate,
  onDelete,
  onAddTask,
  addingIn,
  newTitle,
  setNewTitle,
  setAddingIn,
}: KanbanColumnProps) {
  const config = statusConfig[status];
  const isAdding = addingIn === status;

  async function handleAdd(e?: React.FormEvent) {
    e?.preventDefault();
    if (!newTitle.trim()) {
      setAddingIn(null);
      return;
    }
    onAddTask(status);
    setNewTitle("");
    setAddingIn(null);
  }

  return (
    <div
      data-testid="kanban-column"
      onDragOver={(e) => { e.preventDefault(); onDragOver(e); }}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "flex min-h-[400px] flex-col rounded-2xl border border-border bg-card/80 p-3 backdrop-blur transition-colors",
        dragOver && "border-primary bg-primary/5",
      )}
    >
      <div className="mb-3 flex items-center justify-between px-1" data-testid="kanban-column-header">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", config.dot)} />
          <span className="text-sm font-semibold">{config.label}</span>
          <span className="rounded-full bg-muted px-1.5 text-[11px] font-medium text-muted-foreground">
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-md p-1 text-muted-foreground hover:bg-muted"
          onClick={() => setAddingIn(status)}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {tasks.map((task) => {
          const projectColor = projectColorMap.get(task.project_id) ?? "#6366f1";
          const projectName = projectNameMap.get(task.project_id) ?? "Unknown";
          const assignee = task.assignee_id ? assigneeMap.get(task.assignee_id) : null;

          return (
            <KanbanTaskCard
              key={task.id}
              task={task}
              projectColor={projectColor}
              projectName={projectName}
              assignee={assignee}
              onOpen={() => onOpenTask(task)}
              onDragStart={(e) => onDragStart(e, task.id, task.project_id)}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          );
        })}

        {isAdding && (
          <form onSubmit={handleAdd} className="rounded-lg border border-primary/40 bg-card p-2" data-testid="kanban-add-form">
            <Input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd(e);
                if (e.key === "Escape") setAddingIn(null);
              }}
              placeholder="Task title"
              className="h-8"
            />
            <div className="mt-2 flex justify-end gap-1">
              <Button type="button" size="sm" variant="ghost" onClick={() => setAddingIn(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Add
              </Button>
            </div>
          </form>
        )}

        {tasks.length === 0 && !isAdding && (
          <Button
            variant="ghost"
            className="mt-1 flex items-center justify-center gap-1 rounded-lg border border-dashed border-border py-6 text-xs text-muted-foreground hover:border-primary/60 hover:text-primary"
            onClick={() => setAddingIn(status)}
          >
            {config.icon} Add a task
          </Button>
        )}
      </div>
    </div>
  );
}