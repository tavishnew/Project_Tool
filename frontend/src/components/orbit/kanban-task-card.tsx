import { motion } from "framer-motion";
import { Calendar, MoreHorizontal, Play, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PriorityBadge } from "@/components/orbit/badges";
import { MemberAvatar } from "@/components/orbit/member-avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Task, TaskStatus } from "@/types";

interface KanbanTaskCardProps {
  task: Task;
  projectColor: string;
  projectName: string;
  assignee?: { id: string; name: string; color?: string } | null;
  onOpen: () => void;
  onDragStart: (e: React.DragEvent, taskId: string, projectId: string) => void;
  onUpdate: (taskId: string, data: Partial<Task>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

const statusActions: Record<TaskStatus, { status: TaskStatus; label: string; icon: React.ReactNode }[]> = {
  todo: [
    { status: "in_progress", label: "Start progress", icon: <Play className="h-4 w-4" /> },
    { status: "review", label: "Move to review", icon: <ArrowRight className="h-4 w-4" /> },
  ],
  in_progress: [
    { status: "review", label: "Move to review", icon: <ArrowRight className="h-4 w-4" /> },
    { status: "done", label: "Mark complete", icon: <CheckCircle2 className="h-4 w-4" /> },
    { status: "todo", label: "Back to backlog", icon: <ArrowRight className="h-4 w-4 rotate-180" /> },
  ],
  review: [
    { status: "done", label: "Mark complete", icon: <CheckCircle2 className="h-4 w-4" /> },
    { status: "in_progress", label: "Back to progress", icon: <ArrowRight className="h-4 w-4 rotate-180" /> },
  ],
  done: [
    { status: "in_progress", label: "Reopen", icon: <Play className="h-4 w-4" /> },
    { status: "todo", label: "Back to backlog", icon: <ArrowRight className="h-4 w-4 rotate-180" /> },
  ],
};

export function KanbanTaskCard({
  task,
  projectColor,
  projectName,
  assignee,
  onOpen,
  onDragStart,
  onUpdate,
  onDelete,
}: KanbanTaskCardProps) {
  const actions = statusActions[task.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      draggable
      onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, task.id, task.project_id)}
      onClick={onOpen}
      className="cursor-grab rounded-lg border border-border bg-card p-3 shadow-[0_1px_0_oklch(0.93_0.005_60)] transition-shadow hover:shadow-md active:cursor-grabbing"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug">{task.title}</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-md p-1 text-muted-foreground hover:bg-muted">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[160px]">
            <DropdownMenuLabel>Change status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {actions.map((action) => (
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
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(task.id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center justify-between">
        <PriorityBadge value={task.priority as any} />
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span
            className="flex-shrink-0 h-2 w-2 rounded-full"
            style={{ backgroundColor: projectColor }}
            title={projectName}
          />
          {task.due_date && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(task.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          )}
          {assignee && (
            <MemberAvatar member={assignee} size={20} />
          )}
        </div>
      </div>
    </motion.div>
  );
}