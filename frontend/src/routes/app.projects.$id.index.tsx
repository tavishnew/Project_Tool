import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MoreHorizontal, Calendar, Play, CheckCircle2, ArrowRight } from "lucide-react";
import { api } from "@/api";
import { PriorityBadge } from "@/components/orbit/badges";
import { MemberAvatar } from "@/components/orbit/member-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskDialog } from "@/components/orbit/task-dialog";
import { StatusDot } from "@/components/orbit/status-dot";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { STATUS_LABELS, type Task, type TaskStatus } from "@/types";

export const Route = createFileRoute("/app/projects/$id/")({
  component: BoardPage,
});

const STATUS_KEYS: TaskStatus[] = ["todo", "in_progress", "review", "done"];

const statusConfig: Record<TaskStatus, { label: string }> = {
  todo: { label: "Backlog" },
  in_progress: { label: "In Progress" },
  review: { label: "In Review" },
  done: { label: "Done" },
};

function BoardPage() {
  const { id } = Route.useParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [openTask, setOpenTask] = useState<Task | null>(null);
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);
  const [addingIn, setAddingIn] = useState<TaskStatus | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);

  async function fetchTasks() {
    setLoading(true);
    try {
      const data = await api.listTasks(id);
      setTasks(data.tasks);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  async function fetchMembers() {
    try {
      const data = await api.getProject(id);
      if (data.project.members) {
        setMembers(data.project.members.map((m: any) => ({ id: m.id, name: m.name })));
      }
    } catch {}
  }

  useEffect(() => {
    fetchTasks();
    fetchMembers();
  }, [id]);

  const grouped = STATUS_KEYS.map((status) => ({
    status,
    items: tasks.filter((t) => t.status === status),
  }));

  function onDragStart(e: React.DragEvent, taskId: string) {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  }

  async function onDrop(e: React.DragEvent, status: TaskStatus) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      try {
        await api.updateTask(taskId, { status } as any);
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
      } catch {
        toast.error("Failed to move task");
      }
    }
    setDragOver(null);
  }

  async function addTask(status: TaskStatus) {
    if (!newTitle.trim()) {
      setAddingIn(null);
      return;
    }
    try {
      await api.createTask(id, { title: newTitle.trim(), status, priority: "medium" });
      setNewTitle("");
      setAddingIn(null);
      fetchTasks();
    } catch {
      toast.error("Failed to create task");
    }
  }

  async function handleUpdate(taskId: string, data: Partial<Task>) {
    await api.updateTask(taskId, data as any);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...data } : t)));

    // Check if all tasks are now done and auto-complete project
    if (data.status === "done") {
      const updatedTasks = tasks.map((t) => (t.id === taskId ? { ...t, status: "done" as const } : t));
      const allDone = updatedTasks.length > 0 && updatedTasks.every((t) => t.status === "done");
      if (allDone) {
        try {
          await api.updateProject(id, { status: "completed" });
        } catch (err) {
          console.error("Failed to auto-complete project:", err);
        }
      }
    }
  }

  async function handleDelete(taskId: string) {
    await api.deleteTask(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">Loading board...</div>;
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {grouped.map(({ status, items }) => (
          <section
            key={status}
            aria-label={`${statusConfig[status].label} column`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(status); }}
            onDragLeave={() => setDragOver((s) => (s === status ? null : s))}
            onDrop={(e) => onDrop(e, status)}
            className={cn(
              "flex min-h-[320px] flex-col rounded-2xl border border-border bg-card/80 p-3 backdrop-blur transition-colors",
              dragOver === status && "border-primary bg-primary/5",
            )}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <StatusDot status={status} />
                <span className="text-sm font-semibold">{statusConfig[status].label}</span>
                <span className="rounded-full bg-muted px-1.5 text-[11px] font-medium text-muted-foreground">
                  {items.length}
                </span>
              </div>
              <button
                aria-label={`Add task to ${statusConfig[status].label}`}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setAddingIn(status)}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-2">
              <AnimatePresence initial={false}>
                {items.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onOpen={() => setOpenTask(t)}
                    onDragStart={onDragStart}
                    members={members}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>

              {addingIn === status && (
                <div className="rounded-lg border border-primary/40 bg-card p-2">
                  <Input
                    autoFocus
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addTask(status);
                      if (e.key === "Escape") setAddingIn(null);
                    }}
                    placeholder="Task title"
                    className="h-8"
                  />
                  <div className="mt-2 flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setAddingIn(null)}>Cancel</Button>
                    <Button size="sm" onClick={() => addTask(status)}>Add</Button>
                  </div>
                </div>
              )}

              {items.length === 0 && addingIn !== status && (
                <button
                  onClick={() => setAddingIn(status)}
                  className="mt-1 flex items-center justify-center gap-1 rounded-lg border border-dashed border-border py-6 text-xs text-muted-foreground hover:border-primary/60 hover:text-primary"
                >
                  <Plus className="h-3.5 w-3.5" /> Add a task
                </button>
              )}
            </div>
          </section>
        ))}
      </div>

      <TaskDialog
        task={openTask}
        members={members}
        onClose={() => setOpenTask(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </>
  );
}
function TaskCard({
  task,
  onOpen,
  onDragStart,
  members,
  onUpdate,
  onDelete,
}: {
  task: Task;
  onOpen: () => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  members: { id: string; name: string }[];
  onUpdate: (id: string, data: Partial<Task>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const assignee = members.find((m) => m.id === task.assignee_id);

  const statusActions: { status: TaskStatus; label: string; icon: React.ReactNode }[] = [];
  if (task.status === "todo") {
    statusActions.push(
      { status: "in_progress", label: "Start progress", icon: <Play className="h-4 w-4" /> },
      { status: "review", label: "Move to review", icon: <ArrowRight className="h-4 w-4" /> },
    );
  } else if (task.status === "in_progress") {
    statusActions.push(
      { status: "review", label: "Move to review", icon: <ArrowRight className="h-4 w-4" /> },
      { status: "done", label: "Mark complete", icon: <CheckCircle2 className="h-4 w-4" /> },
      { status: "todo", label: "Back to backlog", icon: <ArrowRight className="h-4 w-4 rotate-180" /> },
    );
  } else if (task.status === "review") {
    statusActions.push(
      { status: "done", label: "Mark complete", icon: <CheckCircle2 className="h-4 w-4" /> },
      { status: "in_progress", label: "Back to progress", icon: <ArrowRight className="h-4 w-4 rotate-180" /> },
    );
  } else if (task.status === "done") {
    statusActions.push(
      { status: "in_progress", label: "Reopen", icon: <Play className="h-4 w-4" /> },
      { status: "todo", label: "Back to backlog", icon: <ArrowRight className="h-4 w-4 rotate-180" /> },
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      draggable
      onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, task.id)}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${task.title} — ${STATUS_LABELS[task.status]}`}
      className="cursor-grab rounded-lg border border-border bg-card p-3 shadow-[0_1px_0_oklch(0.93_0.005_60)] transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug">{task.title}</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Task actions"
              className="rounded-md p-1 text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[160px]">
            <DropdownMenuLabel>Change status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {statusActions.map((action) => (
              <DropdownMenuItem
                key={action.status}
                className="flex items-center gap-2"
                onClick={() => onUpdate(task.id, { status: action.status })}
              >
                <span className="flex h-4 w-4 items-center justify-center">{action.icon}</span>
                {action.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(task.id)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PriorityBadge value={task.priority as any} />
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <StatusDot status={task.status} className="h-1.5 w-1.5" />
            {STATUS_LABELS[task.status]}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {task.due_date && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(task.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          )}
          {assignee && <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-semibold text-primary">{assignee.name[0]}</div>}
        </div>
      </div>
    </motion.div>
  );
}
