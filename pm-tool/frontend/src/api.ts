import type { Project, ProjectDetail, Task, TaskStatus, TaskPriority } from "./types";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "1";
const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

/* ---------------- dev-only mock backend (VITE_USE_MOCK=1) ---------------- */
type MProject = Project & { tasks: Task[] };

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x));
}

const MOCK: MProject[] = [
  {
    id: "p1",
    name: "Website Revamp",
    description: "Refresh the marketing site and blog.",
    color: "#2F5D50",
    created_at: "2026-06-02T10:00:00Z",
    task_count: 0,
    done_count: 0,
    tasks: [
      { id: "t1", project_id: "p1", title: "Audit current pages", description: "Inventory all routes and CTAs.", status: "done", priority: "high", due_date: "2026-07-05", order: 0, created_at: "2026-06-02T10:00:00Z", updated_at: "2026-06-10T10:00:00Z" },
      { id: "t2", project_id: "p1", title: "Wire auth flow", description: "Login + session handling.", status: "in_progress", priority: "medium", due_date: "2026-07-20", order: 1, created_at: "2026-06-03T10:00:00Z", updated_at: "2026-07-01T10:00:00Z" },
      { id: "t3", project_id: "p1", title: "Design system tokens", description: "", status: "todo", priority: "low", due_date: null, order: 2, created_at: "2026-06-04T10:00:00Z", updated_at: "2026-06-04T10:00:00Z" },
      { id: "t4", project_id: "p1", title: "Build pricing page", description: "Tiers + FAQ.", status: "todo", priority: "medium", due_date: "2026-07-28", order: 3, created_at: "2026-06-05T10:00:00Z", updated_at: "2026-06-05T10:00:00Z" },
    ],
  },
  {
    id: "p2",
    name: "Mobile App Launch",
    description: "App Store + Play submit.",
    color: "#B3402F",
    created_at: "2026-06-12T10:00:00Z",
    task_count: 0,
    done_count: 0,
    tasks: [
      { id: "t5", project_id: "p2", title: "Screenshots", description: "Capture device frames.", status: "done", priority: "medium", due_date: "2026-06-25", order: 0, created_at: "2026-06-12T10:00:00Z", updated_at: "2026-06-20T10:00:00Z" },
      { id: "t6", project_id: "p2", title: "Beta signup form", description: "", status: "in_progress", priority: "high", due_date: "2026-07-15", order: 1, created_at: "2026-06-13T10:00:00Z", updated_at: "2026-07-02T10:00:00Z" },
    ],
  },
  {
    id: "p3",
    name: "Q3 Reporting",
    description: "Board metrics and wrap-up.",
    color: "#B8862E",
    created_at: "2026-06-20T10:00:00Z",
    task_count: 0,
    done_count: 0,
    tasks: [
      { id: "t7", project_id: "p3", title: "Pull analytics", description: "", status: "todo", priority: "low", due_date: "2026-08-01", order: 0, created_at: "2026-06-20T10:00:00Z", updated_at: "2026-06-20T10:00:00Z" },
      { id: "t8", project_id: "p3", title: "Draft summary", description: "Two-page recap.", status: "todo", priority: "medium", due_date: "2026-08-05", order: 1, created_at: "2026-06-21T10:00:00Z", updated_at: "2026-06-21T10:00:00Z" },
    ],
  },
];

function counts(p: MProject) {
  return { task_count: p.tasks.length, done_count: p.tasks.filter((t) => t.status === "done").length };
}
function toProject(p: MProject): Project {
  return { ...clone(p), ...counts(p) };
}
function toDetail(p: MProject): ProjectDetail {
  return { ...clone(p), ...counts(p), tasks: clone(p.tasks) };
}
function mockRequest<T>(data: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data === undefined ? (undefined as T) : clone(data)), ms));
}

/* ---------------- api ---------------- */
export const api = {
  listProjects: () =>
    USE_MOCK ? mockRequest(MOCK.map(toProject)) : request<Project[]>("/projects"),

  createProject: (data: { name: string; description?: string; color?: string }) => {
    if (USE_MOCK) {
      const p: MProject = {
        id: "p" + (MOCK.length + 1),
        name: data.name,
        description: data.description ?? "",
        color: data.color ?? "#2F5D50",
        created_at: new Date().toISOString(),
        task_count: 0,
        done_count: 0,
        tasks: [],
      };
      MOCK.unshift(p);
      return mockRequest(toProject(p));
    }
    return request<Project>("/projects", { method: "POST", body: JSON.stringify(data) });
  },

  getProject: (id: string) =>
    USE_MOCK ? mockRequest(toDetail(MOCK.find((p) => p.id === id) ?? MOCK[0])) : request<ProjectDetail>(`/projects/${id}`),

  updateProject: (id: string, data: Partial<{ name: string; description: string; color: string }>) => {
    if (USE_MOCK) {
      const p = MOCK.find((x) => x.id === id);
      if (p) Object.assign(p, data);
      return mockRequest(toProject(p ?? MOCK[0]));
    }
    return request<Project>(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },

  deleteProject: (id: string) => {
    if (USE_MOCK) {
      const i = MOCK.findIndex((p) => p.id === id);
      if (i >= 0) MOCK.splice(i, 1);
      return mockRequest(undefined as void);
    }
    return request<void>(`/projects/${id}`, { method: "DELETE" });
  },

  createTask: (
    projectId: string,
    data: { title: string; description?: string; status?: TaskStatus; priority?: TaskPriority; due_date?: string | null }
  ) => {
    if (USE_MOCK) {
      const p = MOCK.find((x) => x.id === projectId);
      const t: Task = {
        id: "t" + Date.now(),
        project_id: projectId,
        title: data.title,
        description: data.description ?? "",
        status: data.status ?? "todo",
        priority: data.priority ?? "medium",
        due_date: data.due_date ?? null,
        order: p ? p.tasks.length : 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      p?.tasks.push(t);
      return mockRequest(t);
    }
    return request<Task>(`/projects/${projectId}/tasks`, { method: "POST", body: JSON.stringify(data) });
  },

  updateTask: (
    id: string,
    data: Partial<{ title: string; description: string; status: TaskStatus; priority: TaskPriority; due_date: string | null; order: number }>
  ) => {
    if (USE_MOCK) {
      for (const p of MOCK) {
        const t = p.tasks.find((x) => x.id === id);
        if (t) {
          Object.assign(t, data);
          return mockRequest(t);
        }
      }
      return mockRequest(undefined as unknown as Task);
    }
    return request<Task>(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },

  deleteTask: (id: string) => {
    if (USE_MOCK) {
      for (const p of MOCK) {
        const i = p.tasks.findIndex((x) => x.id === id);
        if (i >= 0) {
          p.tasks.splice(i, 1);
          break;
        }
      }
      return mockRequest(undefined as void);
    }
    return request<void>(`/tasks/${id}`, { method: "DELETE" });
  },
};
