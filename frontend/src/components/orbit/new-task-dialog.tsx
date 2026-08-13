import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/api";
import type { Project, TaskStatus, TaskPriority, Member } from "@/types";

const statuses: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "In Review" },
  { value: "done", label: "Done" },
];

const priorities: TaskPriority[] = ["low", "medium", "high", "urgent"];
const priorityLabels: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "We could not create this task. Check your connection and try again.";
}

export function NewTaskDialog({
  open,
  onOpenChange,
  projects,
  members,
  onCreateTask,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  members: Member[];
  onCreateTask?: (projectId: string, data: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignee_id: string | null;
  }) => Promise<void>;
}) {
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assigneeId, setAssigneeId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId && projects[0]?.id) setProjectId(projects[0].id);
  }, [projectId, projects]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setError(null);
      setTitleError(null);
    }
    onOpenChange(nextOpen);
  };

  const submit = async () => {
    if (!title.trim()) {
      setTitleError("Add a short, specific task title before creating it.");
      return;
    }
    if (!projectId) {
      setError("Choose a project for this task before creating it.");
      return;
    }

    setLoading(true);
    setError(null);
    setTitleError(null);
    try {
      const taskData = {
        title: title.trim(),
        description: desc.trim(),
        status,
        priority,
        assignee_id: assigneeId ?? null,
      };
      if (onCreateTask) {
        await onCreateTask(projectId, taskData);
      } else {
        await api.createTask(projectId, taskData);
      }
      setTitle("");
      setDesc("");
      setStatus("todo");
      setPriority("medium");
      setAssigneeId(undefined);
      handleOpenChange(false);
    } catch (creationError) {
      setError(getErrorMessage(creationError));
      console.error("Task creation failed", creationError);
    } finally {
      setLoading(false);
    }
  };

  if (projects.length === 0) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent data-testid="new-task-dialog-empty" className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create a project first</DialogTitle>
            <DialogDescription>
              Tasks live inside projects. Create a project, then return here to add its first task.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => handleOpenChange(false)}>Cancel</Button>
            <Button asChild>
              <Link to="/app/projects/new" onClick={() => handleOpenChange(false)}>Create project</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-lg overflow-y-auto sm:max-w-xl" data-testid="new-task-dialog">
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
          <DialogDescription>Capture a clear next step for one of your projects.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="nt-project">Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger id="nt-project"><SelectValue placeholder="Select a project" /></SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <Label htmlFor="nt-title">Task title <span className="text-destructive">*</span></Label>
              <span className="text-xs text-muted-foreground">Required</span>
            </div>
            <Input
              id="nt-title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (titleError) setTitleError(null);
              }}
              placeholder="For example: Prepare the landing-page brief"
              aria-invalid={Boolean(titleError)}
              aria-describedby={titleError ? "nt-title-error" : undefined}
              autoFocus
            />
            {titleError && <p id="nt-title-error" className="text-sm text-destructive">{titleError}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nt-desc">Description <span className="font-normal text-muted-foreground">(optional)</span></Label>
            <Textarea id="nt-desc" value={desc} onChange={(event) => setDesc(event.target.value)} placeholder="Add useful context, acceptance criteria, or a link." rows={3} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="nt-status">Status</Label>
              <Select value={status} onValueChange={(value: TaskStatus) => setStatus(value)}>
                <SelectTrigger id="nt-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nt-priority">Priority</Label>
              <Select value={priority} onValueChange={(value: TaskPriority) => setPriority(value)}>
                <SelectTrigger id="nt-priority"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {priorities.map((item) => <SelectItem key={item} value={item}>{priorityLabels[item]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nt-assignee">Assignee</Label>
              <Select value={assigneeId ?? "none"} onValueChange={(value: string) => setAssigneeId(value === "none" ? undefined : value)}>
                <SelectTrigger id="nt-assignee"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {members.map((member) => <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter className="gap-2 pt-2 sm:gap-0">
          <Button variant="ghost" onClick={() => handleOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={submit} disabled={loading || !title.trim() || !projectId}>
            {loading ? "Creating task…" : "Create task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
