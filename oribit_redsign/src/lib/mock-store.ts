import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Priority = "low" | "medium" | "high" | "urgent";
export type Status = "backlog" | "in_progress" | "review" | "done";

export type Member = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  color: string;
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  assigneeId?: string;
  dueDate?: string;
  createdAt: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
  memberIds: string[];
};

export type User = { id: string; name: string; email: string };

type State = {
  user: User | null;
  projects: Project[];
  tasks: Task[];
  members: Member[];
};

type Actions = {
  login: (email: string, name?: string) => void;
  logout: () => void;
  createProject: (p: Omit<Project, "id" | "createdAt" | "memberIds"> & { memberIds?: string[] }) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  createTask: (t: Omit<Task, "id" | "createdAt">) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  moveTask: (id: string, status: Status) => void;
  deleteTask: (id: string) => void;
  inviteMember: (email: string, name: string) => Member;
};

const uid = () => Math.random().toString(36).slice(2, 10);

const seedMembers: Member[] = [
  { id: "m1", name: "Ava Chen", email: "ava@orbit.app", role: "owner", color: "#ff5a4e" },
  { id: "m2", name: "Milo Ray", email: "milo@orbit.app", role: "admin", color: "#f59e0b" },
  { id: "m3", name: "Sana Park", email: "sana@orbit.app", role: "member", color: "#10b981" },
  { id: "m4", name: "Ken Ito", email: "ken@orbit.app", role: "member", color: "#6366f1" },
];

const seedProjects: Project[] = [
  {
    id: "p1",
    name: "Aurora Launch",
    description: "Public beta for the new onboarding flow",
    color: "#ff5a4e",
    createdAt: new Date().toISOString(),
    memberIds: ["m1", "m2", "m3"],
  },
  {
    id: "p2",
    name: "Design System 2.0",
    description: "Token refresh, motion primitives, docs",
    color: "#f59e0b",
    createdAt: new Date().toISOString(),
    memberIds: ["m1", "m3", "m4"],
  },
  {
    id: "p3",
    name: "Q3 Marketing Site",
    description: "Rewrite the marketing pages with new brand",
    color: "#6366f1",
    createdAt: new Date().toISOString(),
    memberIds: ["m2", "m4"],
  },
];

const seedTasks: Task[] = [
  { id: uid(), projectId: "p1", title: "Auth wire-up", status: "in_progress", priority: "high", assigneeId: "m1", createdAt: new Date().toISOString(), description: "Hook up JWT + refresh" },
  { id: uid(), projectId: "p1", title: "Empty states", status: "backlog", priority: "medium", assigneeId: "m3", createdAt: new Date().toISOString() },
  { id: uid(), projectId: "p1", title: "Onboarding checklist", status: "review", priority: "high", assigneeId: "m2", createdAt: new Date().toISOString() },
  { id: uid(), projectId: "p1", title: "Analytics events", status: "done", priority: "low", assigneeId: "m1", createdAt: new Date().toISOString() },
  { id: uid(), projectId: "p1", title: "Copy pass", status: "backlog", priority: "low", assigneeId: "m3", createdAt: new Date().toISOString() },
  { id: uid(), projectId: "p1", title: "QA sweep", status: "in_progress", priority: "urgent", assigneeId: "m2", createdAt: new Date().toISOString() },
  { id: uid(), projectId: "p2", title: "Token audit", status: "in_progress", priority: "medium", assigneeId: "m1", createdAt: new Date().toISOString() },
  { id: uid(), projectId: "p2", title: "Motion primitives", status: "backlog", priority: "high", assigneeId: "m4", createdAt: new Date().toISOString() },
  { id: uid(), projectId: "p2", title: "Docs site scaffold", status: "done", priority: "medium", assigneeId: "m3", createdAt: new Date().toISOString() },
  { id: uid(), projectId: "p3", title: "Hero section", status: "review", priority: "high", assigneeId: "m2", createdAt: new Date().toISOString() },
  { id: uid(), projectId: "p3", title: "Pricing page", status: "backlog", priority: "medium", assigneeId: "m4", createdAt: new Date().toISOString() },
];

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      user: null,
      projects: seedProjects,
      tasks: seedTasks,
      members: seedMembers,

      login: (email, name) =>
        set({ user: { id: "u1", email, name: name ?? email.split("@")[0] } }),
      logout: () => set({ user: null }),

      createProject: (p) => {
        const project: Project = {
          ...p,
          id: uid(),
          createdAt: new Date().toISOString(),
          memberIds: p.memberIds ?? ["m1"],
        };
        set({ projects: [project, ...get().projects] });
        return project;
      },
      updateProject: (id, patch) =>
        set({ projects: get().projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) }),
      deleteProject: (id) =>
        set({
          projects: get().projects.filter((p) => p.id !== id),
          tasks: get().tasks.filter((t) => t.projectId !== id),
        }),

      createTask: (t) => {
        const task: Task = { ...t, id: uid(), createdAt: new Date().toISOString() };
        set({ tasks: [...get().tasks, task] });
        return task;
      },
      updateTask: (id, patch) =>
        set({ tasks: get().tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }),
      moveTask: (id, status) =>
        set({ tasks: get().tasks.map((t) => (t.id === id ? { ...t, status } : t)) }),
      deleteTask: (id) => set({ tasks: get().tasks.filter((t) => t.id !== id) }),

      inviteMember: (email, name) => {
        const m: Member = {
          id: uid(),
          email,
          name,
          role: "member",
          color: ["#ff5a4e", "#f59e0b", "#10b981", "#6366f1", "#ec4899"][Math.floor(Math.random() * 5)],
        };
        set({ members: [...get().members, m] });
        return m;
      },
    }),
    { name: "orbit-store" },
  ),
);

export function useHydrated() {
  if (typeof window === "undefined") return false;
  return true;
}

export const statusLabels: Record<Status, string> = {
  backlog: "Backlog",
  in_progress: "In progress",
  review: "In review",
  done: "Done",
};

export const statusOrder: Status[] = ["backlog", "in_progress", "review", "done"];

export const priorityLabels: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};
