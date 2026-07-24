import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MoreHorizontal, Calendar } from "lucide-react";
import { useStore, statusOrder, statusLabels, type Status, type Task } from "@/lib/mock-store";
import { PriorityBadge } from "@/components/orbit/badges";
import { MemberAvatar } from "@/components/orbit/member-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskDialog } from "@/components/orbit/task-dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/projects/$id/")({
  component: BoardPage,
});

function BoardPage() {
  const { id } = Route.useParams();
  const tasks = useStore((s) => s.tasks.filter((t) => t.projectId === id));
  const moveTask = useStore((s) => s.moveTask);
  const createTask = useStore((s) => s.createTask);
  const [openTask, setOpenTask] = useState<Task | null>(null);
  const [dragOver, setDragOver] = useState<Status | null>(null);
  const [addingIn, setAddingIn] = useState<Status | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const grouped = statusOrder.map((s) => ({
    status: s,
    items: tasks.filter((t) => t.status === s),
  }));

  function onDragStart(e: React.DragEvent, taskId: string) {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  }
  function onDrop(e: React.DragEvent, status: Status) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) moveTask(taskId, status);
    setDragOver(null);
  }

  function addTask(status: Status) {
    if (!newTitle.trim()) {
      setAddingIn(null);
      return;
    }
    createTask({
      projectId: id,
      title: newTitle.trim(),
      status,
      priority: "medium",
    });
    setNewTitle("");
    setAddingIn(null);
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {grouped.map(({ status, items }) => (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(status);
            }}
            onDragLeave={() => setDragOver((s) => (s === status ? null : s))}
            onDrop={(e) => onDrop(e, status)}
            className={cn(
              "flex min-h-[320px] flex-col rounded-2xl border border-border bg-card/80 p-3 backdrop-blur transition-colors",
              dragOver === status && "border-primary bg-primary/5",
            )}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", statusDot[status])} />
                <span className="text-sm font-semibold">{statusLabels[status]}</span>
                <span className="rounded-full bg-muted px-1.5 text-[11px] font-medium text-muted-foreground">
                  {items.length}
                </span>
              </div>
              <button
                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                onClick={() => setAddingIn(status)}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-2">
              <AnimatePresence initial={false}>
                {items.map((t) => (
                  <TaskCard key={t.id} task={t} onOpen={() => setOpenTask(t)} onDragStart={onDragStart} />
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
                    <Button size="sm" variant="ghost" onClick={() => setAddingIn(null)}>
                      Cancel
                    </Button>
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
          </div>
        ))}
      </div>

      <TaskDialog task={openTask} onClose={() => setOpenTask(null)} />
    </>
  );
}

const statusDot: Record<Status, string> = {
  backlog: "bg-muted-foreground/40",
  in_progress: "bg-info",
  review: "bg-warning",
  done: "bg-success",
};

function TaskCard({
  task,
  onOpen,
  onDragStart,
}: {
  task: Task;
  onOpen: () => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}) {
  const assignee = useStore((s) => s.members.find((m) => m.id === task.assigneeId));
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
      className="cursor-grab rounded-lg border border-border bg-card p-3 shadow-[0_1px_0_oklch(0.93_0.005_60)] transition-shadow hover:shadow-md active:cursor-grabbing"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug">{task.title}</p>
        <MoreHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
      </div>
      <div className="flex items-center justify-between">
        <PriorityBadge value={task.priority} />
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {task.dueDate && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          )}
          {assignee && <MemberAvatar member={assignee} size={22} />}
        </div>
      </div>
    </motion.div>
  );
}
