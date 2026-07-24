import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/api";
import { PriorityBadge } from "@/components/orbit/badges";
import { MemberAvatar } from "@/components/orbit/member-avatar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { TaskDialog } from "@/components/orbit/task-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import type { Task } from "@/types";

export const Route = createFileRoute("/app/projects/$id/list")({
  component: ListPage,
});

function ListPage() {
  const { id } = Route.useParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
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
      if (data.project.members) setMembers(data.project.members.map((m: any) => ({ id: m.id, name: m.name })));
    } catch {}
  }

  const filtered = tasks.filter((t) => t.title.toLowerCase().includes(q.toLowerCase()));
  const statusRank: Record<string, number> = { todo: 0, in_progress: 1, review: 2, done: 3 };
  const sorted = [...filtered].sort((a, b) => statusRank[a.status] - statusRank[b.status]);

  async function handleUpdate(taskId: string, data: Partial<Task>) {
    await api.updateTask(taskId, data as any);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...data } : t)));
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
                <TableRow key={t.id} className="cursor-pointer" onClick={() => setOpenTask(t)}>
                  <TableCell className="font-medium">{t.title}</TableCell>
                  <TableCell><span className="text-xs text-muted-foreground">{t.status}</span></TableCell>
                  <TableCell><PriorityBadge value={t.priority as any} /></TableCell>
                  <TableCell>
                    {a ? (
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-semibold text-primary">{a.name[0]}</div>
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