import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  MoreHorizontal,
  Play,
  Plus,
  UserPlus,
  Users,
} from "lucide-react";
import { api } from "@/api";
import { PriorityBadge } from "@/components/orbit/badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskDialog } from "@/components/orbit/task-dialog";
import { StatusDot } from "@/components/orbit/status-dot";
import { ProjectInviteManager } from "@/components/orbit/project-invite-manager";
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
import { STATUS_LABELS, type Project, type Task, type TaskStatus } from "@/types";

export const Route = createFileRoute("/app/projects/$id/")({
  component: BoardPage,
});

const STATUS_KEYS: TaskStatus[] = ["todo", "in_progress", "review", "done"];

const statusConfig: Record<TaskStatus, { label: string; helper: string }> = {
  todo: { label: "Backlog", helper: "Ready to pick up" },
  in_progress: { label: "In progress", helper: "Work underway" },
  review: { label: "In review", helper: "Awaiting feedback" },
  done: { label: "Completed", helper: "Finished work" },
};

function BoardPage() {
  const { id } = Route.useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [openTask, setOpenTask] = useState<Task | null>(null);
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);
  const [addingIn, setAddingIn] = useState<TaskStatus | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [canManageMembers, setCanManageMembers] = useState(false);
  const [showAccess, setShowAccess] = useState(false);

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

  async function fetchProject() {
    try {
      const data = await api.getProject(id);
      setProject(data.project);
      if (data.project.members) {
        setMembers(data.project.members.map((member) => ({ id: member.id, name: member.name })));
      }
      setCanManageMembers(Boolean(data.project.can_manage_members));
    } catch {
      toast.error("Failed to load project details");
    }
  }

  useEffect(() => {
    void fetchTasks();
    void fetchProject();
  }, [id]);

  const grouped = STATUS_KEYS.map((status) => ({
    status,
    items: tasks.filter((task) => task.status === status),
  }));
  const completeCount = tasks.filter((task) => task.status === "done").length;
  const progress = tasks.length ? Math.round((completeCount / tasks.length) * 100) : 0;
  const memberCount = members.length || project?.member_count || 1;

  function onDragStart(event: React.DragEvent, taskId: string) {
    event.dataTransfer.setData("text/plain", taskId);
    event.dataTransfer.effectAllowed = "move";
  }

  async function onDrop(event: React.DragEvent, status: TaskStatus) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text/plain");
    if (taskId) {
      try {
        await api.updateTask(taskId, { status } as any);
        setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, status } : task)));
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
      void fetchTasks();
    } catch {
      toast.error("Failed to create task");
    }
  }

  async function handleUpdate(taskId: string, data: Partial<Task>) {
    await api.updateTask(taskId, data as any);
    setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, ...data } : task)));

    if (data.status === "done") {
      const updatedTasks = tasks.map((task) => (task.id === taskId ? { ...task, status: "done" as const } : task));
      if (updatedTasks.length > 0 && updatedTasks.every((task) => task.status === "done")) {
        try {
          await api.updateProject(id, { status: "completed" });
          setProject((current) => (current ? { ...current, status: "completed" } : current));
        } catch (error) {
          console.error("Failed to auto-complete project:", error);
        }
      }
    }
  }

  async function handleDelete(taskId: string) {
    await api.deleteTask(taskId);
    setTasks((current) => current.filter((task) => task.id !== taskId));
  }

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Loading project workspace…</div>;
  }

  return (
    <div className="space-y-4 pb-4">
      <section className="ledger-frame relative overflow-hidden">
        <div className="absolute left-4 top-4 h-2.5 w-2.5 border border-primary-foreground/50" style={{ backgroundColor: project?.color || "#A0522D" }} />
        <div className="p-4 pt-7 sm:px-5 sm:py-5 sm:pt-7">
          <Link to="/app" className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> All projects
          </Link>

          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 border border-primary-foreground/40" style={{ backgroundColor: project?.color || "#A0522D" }} />
                <span className={cn(
                  "border px-2 py-0.5 font-ui text-[11px] font-bold",
                  project?.status === "completed" ? "border-success/40 bg-success/10 text-success" : "border-primary/30 bg-primary/5 text-primary",
                )}>
                  {project?.status === "completed" ? "Completed" : "Active project"}
                </span>
              </div>
              <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">{project?.name || "Project workspace"}</h1>
              <p className="mt-1 max-w-2xl text-sm leading-5 text-muted-foreground">
                {project?.description || "Start by adding your first task, then move work across the board as it progresses."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 lg:shrink-0">
              {canManageMembers && (
                <Button size="sm" variant="outline" onClick={() => setShowAccess((current) => !current)}>
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" /> {showAccess ? "Close access" : "Manage access"}
                </Button>
              )}
              <Button size="sm" onClick={() => setAddingIn("todo")}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add task
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 border-t border-border">
          <div className="flex items-center gap-2 px-3 py-2.5 sm:px-5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-primary/25 bg-primary/10 text-primary"><ClipboardList className="h-3.5 w-3.5" /></span>
            <div className="min-w-0"><p className="text-base font-semibold leading-5">{tasks.length}</p><p className="truncate text-[11px] text-muted-foreground">Tasks</p></div>
          </div>
          <div className="flex items-center gap-2 border-l border-border px-3 py-2.5 sm:px-5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-success/25 bg-success/10 text-success"><CheckCircle2 className="h-3.5 w-3.5" /></span>
            <div className="min-w-0"><p className="text-base font-semibold leading-5">{progress}%</p><p className="truncate text-[11px] text-muted-foreground">Complete</p></div>
          </div>
          <div className="flex items-center gap-2 border-l border-border px-3 py-2.5 sm:px-5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-warning/25 bg-warning/10 text-warning"><Users className="h-3.5 w-3.5" /></span>
            <div className="min-w-0"><p className="text-base font-semibold leading-5">{memberCount}</p><p className="truncate text-[11px] text-muted-foreground">{memberCount === 1 ? "Member" : "Members"}</p></div>
          </div>
        </div>
      </section>

      {canManageMembers && showAccess && <ProjectInviteManager projectId={id} />}

      <section aria-label="Task board" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3 px-1">
          <div>
            <h2 className="font-display text-xl font-semibold">Task board</h2>
            <p className="mt-1 text-sm text-muted-foreground">Drag a task between columns or use its action menu to update progress.</p>
          </div>
          <span className="text-sm text-muted-foreground">{completeCount} of {tasks.length} complete</span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:thin]">
          {grouped.map(({ status, items }) => (
            <section
              key={status}
              aria-label={`${statusConfig[status].label} column`}
              onDragOver={(event) => { event.preventDefault(); setDragOver(status); }}
              onDragLeave={() => setDragOver((current) => (current === status ? null : current))}
              onDrop={(event) => onDrop(event, status)}
              className={cn(
                "ledger-column flex min-h-[360px] w-[min(86vw,22rem)] shrink-0 flex-col p-3 transition-colors xl:min-w-0 xl:flex-1",
                dragOver === status && "border-primary bg-primary/10",
              )}
            >
              <div className="mb-3 flex items-start justify-between gap-3 px-1">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <StatusDot status={status} />
                    <span className="text-sm font-semibold">{statusConfig[status].label}</span>
                    <span className="border border-border bg-card px-1.5 py-0.5 font-ui text-[11px] font-bold tabular-nums text-muted-foreground">{items.length}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{statusConfig[status].helper}</p>
                </div>
                <button
                  aria-label={`Add task to ${statusConfig[status].label}`}
                  className="border border-transparent p-1.5 text-muted-foreground transition-colors hover:border-border hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setAddingIn(status)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-2">
                <AnimatePresence initial={false}>
                  {items.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onOpen={() => setOpenTask(task)}
                      onDragStart={onDragStart}
                      members={members}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                  ))}
                </AnimatePresence>

                {addingIn === status && (
                  <div className="ledger-panel border-primary/35 p-3">
                    <Input
                      autoFocus
                      value={newTitle}
                      onChange={(event) => setNewTitle(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") void addTask(status);
                        if (event.key === "Escape") setAddingIn(null);
                      }}
                      placeholder="Task title"
                      className="h-9"
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setAddingIn(null)}>Cancel</Button>
                      <Button size="sm" onClick={() => void addTask(status)}>Add task</Button>
                    </div>
                  </div>
                )}

                {items.length === 0 && addingIn !== status && (
                  <button
                    onClick={() => setAddingIn(status)}
                    className="flex min-h-32 flex-1 flex-col items-center justify-center border border-dashed border-border bg-card/45 px-4 text-center text-muted-foreground transition-colors hover:border-primary hover:bg-card hover:text-primary"
                  >
                    <Plus className="mb-2 h-4 w-4" />
                    <span className="text-sm font-medium">No tasks here</span>
                    <span className="mt-1 text-xs">Add a task to get started</span>
                  </button>
                )}
              </div>
            </section>
          ))}
        </div>
      </section>

      <TaskDialog
        task={openTask}
        members={members}
        onClose={() => setOpenTask(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
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
  onDragStart: (event: React.DragEvent, id: string) => void;
  members: { id: string; name: string }[];
  onUpdate: (id: string, data: Partial<Task>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const assignee = members.find((member) => member.id === task.assignee_id);

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
      { status: "in_progress", label: "Move to progress", icon: <ArrowRight className="h-4 w-4 rotate-180" /> },
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
      onDragStart={(event) => onDragStart(event as unknown as React.DragEvent, task.id)}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${task.title} — ${STATUS_LABELS[task.status]}`}
      className="ledger-task-card cursor-grab p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug">{task.title}</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Task actions"
              className="border border-transparent p-1 text-muted-foreground hover:border-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
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
                onClick={() => void onUpdate(task.id, { status: action.status })}
              >
                <span className="flex h-4 w-4 items-center justify-center">{action.icon}</span>
                {action.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => void onDelete(task.id)}>Delete</DropdownMenuItem>
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
          {assignee && <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[9px] font-semibold text-primary">{assignee.name[0]}</div>}
        </div>
      </div>
    </motion.div>
  );
}
