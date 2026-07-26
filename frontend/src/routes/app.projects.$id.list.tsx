import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/api";
import { PriorityBadge } from "@/components/orbit/badges";
import { StatusPill } from "@/components/orbit/StatusPill";
import { MemberAvatar } from "@/components/orbit/member-avatar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { TaskDialog } from "@/components/orbit/task-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import type { Task, TaskStatus } from "@/types";

export const Route = createFileRoute("/app/projects/$id/list")({
  component: ListPage,
});

function ListPage() {
  const { id } = Route.useParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<import("@/types").Member[]>([]);
  const [q, setQ] = useState("");
  const [openTask, setOpenTask] = useState<Task | null>(null);

  useEffect(() => { fetchTasks(); fetchMembers(); }, [id]);

  async function fetchTasks() {
    try {
      const data = await api.listTasks(id);
      setTasks(data.tasks);
    } catch { toast.error("Failed to load tasks"); }
  }
  async function fetchMembers() {
    try {
      const data = await api.getProject(id);
      if (data.project.members) setMembers(data.project.members);
    } catch {}
  }

  const filtered = tasks.filter((t) => t.title.toLowerCase().includes(q.toLowerCase()));
  const statusRank: Record<string, number> = { todo: 0, in_progress: 1, review: 2, done: 3 };
  const sorted = [...filtered].sort((a, b) => statusRank[a.status] - statusRank[b.status]);

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

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search tasks…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assignee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((t) => {
              const a = members.find((m) => m.id === t.assignee_id);
              return (
                <TableRow key={t.id} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); setOpenTask(t); }}>
                  <TableCell className="font-medium">{t.title}</TableCell>
                  <TableCell>
                    <Select value={t.status} onValueChange={(v: TaskStatus) => handleUpdate(t.id, { status: v })}>
                      <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">Backlog</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="review">In Review</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell><PriorityBadge value={t.priority as any} /></TableCell>
                  <TableCell>
                    {a ? (
                      <div className="flex items-center gap-2">
                        <MemberAvatar member={a} size={24} />
                        <span className="text-sm">{a.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                  No tasks match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <TaskDialog task={openTask} members={members} onClose={() => setOpenTask(null)} onUpdate={handleUpdate} onDelete={handleDelete} />
    </div>
  );
}
