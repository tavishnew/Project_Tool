import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import { api } from "../api";
import type { Member, Project, Task } from "../types";
import { PriorityBadge } from "@/components/orbit/PriorityBadge";
import { StatusPill } from "@/components/orbit/StatusPill";
import { MemberAvatar } from "@/components/orbit/MemberAvatar";
import { Input } from "@/components/ui/Input";
import { Search } from "lucide-react";
import TaskModal from "../components/TaskModal";
import { useToast } from "../components/Toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

type SortKey = "title" | "assignee" | "due" | "priority" | "status";
type Dir = "asc" | "desc";

export default function ListPage() {
  const { id = "" } = useParams();
  const { notify } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("due");
  const [dir, setDir] = useState<Dir>("asc");
  const [editing, setEditing] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([api.getProject(id), api.listTasks(id)])
      .then(([p, t]) => {
        setProject(p.project);
        setMembers(p.project.members ?? []);
        setTasks(t.tasks);
      })
      .catch((e) => notify(e.message, "error"))
      .finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  const memberOf = (mid: string | null) => members.find((m) => m.id === mid);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [tasks, searchQuery]);

  const sorted = useMemo(() => {
    const arr = [...filteredTasks];
    const cmp = (a: Task, b: Task): number => {
      switch (sortKey) {
        case "title":
          return a.title.localeCompare(b.title);
        case "assignee":
          return (
            (memberOf(a.assignee_id)?.name ?? "~").localeCompare(
              memberOf(b.assignee_id)?.name ?? "~",
            )
          );
        case "due": {
          const av = a.due_date ? new Date(a.due_date).getTime() : Infinity;
          const bv = b.due_date ? new Date(b.due_date).getTime() : Infinity;
          return av - bv;
        }
        case "priority":
          return (
            { high: 3, medium: 2, low: 1 }[a.priority] -
            { high: 3, medium: 2, low: 1 }[b.priority]
          );
        case "status": {
          const order = { todo: 0, in_progress: 1, done: 2 };
          return order[a.status] - order[b.status];
        }
      }
    };
    arr.sort(cmp);
    if (dir === "desc") arr.reverse();
    return arr;
  }, [filteredTasks, sortKey, dir, members]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setDir("asc");
    }
  };

  const arrow = (key: SortKey) =>
    key === sortKey ? (dir === "asc" ? "↑" : "↓") : null;

  const saveTask = async (data: {
    title: string;
    description: string;
    assigneeId: string | null;
    priority: Task["priority"];
    dueDate: string | null;
    status: Task["status"];
  }) => {
    if (!editing) return;
    const { task } = await api.updateTask(editing.id, data);
    setTasks((ts) => ts.map((t) => (t.id === task.id ? task : t)));
    notify("Task updated");
    setEditing(null);
  };

  const deleteTask = async () => {
    if (!editing) return;
    await api.deleteTask(editing.id);
    setTasks((ts) => ts.filter((t) => t.id !== editing.id));
    notify("Task deleted");
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="board-toolbar">
        <Link to="/projects" className="btn btn-ghost">
          ← Projects
        </Link>
        <h1 className="page-title" style={{ fontSize: 22 }}>
          {project?.name ?? "Project"}
        </h1>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <div className="seg">
            <NavLink
              to={`/projects/${id}`}
              end
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Board
            </NavLink>
            <NavLink
              to={`/projects/${id}/list`}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              List
            </NavLink>
            <NavLink
              to={`/projects/${id}/settings`}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Settings
            </NavLink>
          </div>
          <Link to={`/projects/${id}`} className="btn btn-primary">
            + Add Task
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="page-loading">Loading tasks…</div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <h3>No tasks yet</h3>
          <p>Switch to the Board tab to add your first task.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search tasks…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
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
                  const assignee = memberOf(t.assignee_id);
                  const assigneeWithColor = assignee
                    ? { ...assignee, color: assignee.color ?? "#6366f1" }
                    : null;
                  return (
                    <TableRow
                      key={t.id}
                      className="cursor-pointer"
                      onClick={() => setEditing(t)}
                    >
                      <TableCell className="font-medium">{t.title}</TableCell>
                      <TableCell>
                        <StatusPill value={t.status} />
                      </TableCell>
                      <TableCell>
                        <PriorityBadge value={t.priority} />
                      </TableCell>
                      <TableCell>
                        {assigneeWithColor ? (
                          <div className="flex items-center gap-2">
                            <MemberAvatar member={assigneeWithColor} size={24} />
                            <span className="text-sm">{assigneeWithColor.name}</span>
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
        </div>
      )}

      {editing && (
        <TaskModal
          members={members}
          task={editing}
          onClose={() => setEditing(null)}
          onSave={saveTask}
          onDelete={deleteTask}
        />
      )}
    </div>
  );
}