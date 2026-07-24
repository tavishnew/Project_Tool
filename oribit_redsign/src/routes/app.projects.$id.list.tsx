import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, type Status } from "@/lib/mock-store";
import { PriorityBadge, StatusPill } from "@/components/orbit/badges";
import { MemberAvatar } from "@/components/orbit/member-avatar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { TaskDialog } from "@/components/orbit/task-dialog";
import type { Task } from "@/lib/mock-store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/app/projects/$id/list")({
  component: ListPage,
});

function ListPage() {
  const { id } = Route.useParams();
  const tasks = useStore((s) => s.tasks.filter((t) => t.projectId === id));
  const members = useStore((s) => s.members);
  const [q, setQ] = useState("");
  const [openTask, setOpenTask] = useState<Task | null>(null);

  const filtered = tasks.filter((t) => t.title.toLowerCase().includes(q.toLowerCase()));

  const _statusRank: Record<Status, number> = { backlog: 0, in_progress: 1, review: 2, done: 3 };
  const sorted = [...filtered].sort((a, b) => _statusRank[a.status] - _statusRank[b.status]);

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
              const a = members.find((m) => m.id === t.assigneeId);
              return (
                <TableRow
                  key={t.id}
                  className="cursor-pointer"
                  onClick={() => setOpenTask(t)}
                >
                  <TableCell className="font-medium">{t.title}</TableCell>
                  <TableCell><StatusPill value={t.status} /></TableCell>
                  <TableCell><PriorityBadge value={t.priority} /></TableCell>
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
      <TaskDialog task={openTask} onClose={() => setOpenTask(null)} />
    </div>
  );
}
