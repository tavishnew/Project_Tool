export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "in_progress" | "done";
export type TaskStatus = Status;

export type Member = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  isOwner: boolean;
  color?: string;
};

export type Task = {
  id: string;
  project_id: string;
  title: string;
  description: string;
  assignee_id: string | null;
  status: TaskStatus;
  priority: Priority;
  due_date: string | null;
  created_at: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
  task_count: number;
  done_count: number;
  member_count: number;
  is_owner?: boolean;
  members?: Member[];
  color?: string;
  memberIds?: string[];
};

const uid = () => Math.random().toString(36).slice(2, 10);

const COLORS = ["#ff5a4e", "#f59e0b", "#10b981", "#6366f1", "#ec4899", "#06b6d4", "#84cc16", "#f97316"];

export const seedMembers: Member[] = [
  { id: "m1", name: "Ava Chen", email: "ava@orbit.app", avatarUrl: null, isOwner: true, color: COLORS[0] },
  { id: "m2", name: "Milo Ray", email: "milo@orbit.app", avatarUrl: null, isOwner: false, color: COLORS[1] },
  { id: "m3", name: "Sana Park", email: "sana@orbit.app", avatarUrl: null, isOwner: false, color: COLORS[2] },
  { id: "m4", name: "Ken Ito", email: "ken@orbit.app", avatarUrl: null, isOwner: false, color: COLORS[3] },
];

const seedProjects: Project[] = [
  {
    id: "p1",
    name: "Aurora Launch",
    description: "Public beta for the new onboarding flow",
    owner_id: "m1",
    created_at: new Date().toISOString(),
    task_count: 6,
    done_count: 1,
    member_count: 3,
    is_owner: true,
    members: [seedMembers[0], seedMembers[1], seedMembers[2]],
    color: COLORS[0],
    memberIds: ["m1", "m2", "m3"],
  },
  {
    id: "p2",
    name: "Design System 2.0",
    description: "Token refresh, motion primitives, docs",
    owner_id: "m1",
    created_at: new Date().toISOString(),
    task_count: 3,
    done_count: 1,
    member_count: 3,
    is_owner: true,
    members: [seedMembers[0], seedMembers[2], seedMembers[3]],
    color: COLORS[1],
    memberIds: ["m1", "m3", "m4"],
  },
  {
    id: "p3",
    name: "Q3 Marketing Site",
    description: "Rewrite the marketing pages with new brand",
    owner_id: "m2",
    created_at: new Date().toISOString(),
    task_count: 2,
    done_count: 0,
    member_count: 2,
    is_owner: false,
    members: [seedMembers[1], seedMembers[3]],
    color: COLORS[3],
    memberIds: ["m2", "m4"],
  },
];

const seedTasks: Task[] = [
  { id: uid(), project_id: "p1", title: "Auth wire-up", description: "Hook up JWT + refresh", assignee_id: "m1", status: "in_progress", priority: "high", due_date: null, created_at: new Date().toISOString() },
  { id: uid(), project_id: "p1", title: "Empty states", description: "", assignee_id: "m3", status: "todo", priority: "medium", due_date: null, created_at: new Date().toISOString() },
  { id: uid(), project_id: "p1", title: "Onboarding checklist", description: "", assignee_id: "m2", status: "in_progress", priority: "high", due_date: null, created_at: new Date().toISOString() },
  { id: uid(), project_id: "p1", title: "Analytics events", description: "", assignee_id: "m1", status: "done", priority: "low", due_date: null, created_at: new Date().toISOString() },
  { id: uid(), project_id: "p1", title: "Copy pass", description: "", assignee_id: "m3", status: "todo", priority: "low", due_date: null, created_at: new Date().toISOString() },
  { id: uid(), project_id: "p1", title: "QA sweep", description: "", assignee_id: "m2", status: "in_progress", priority: "high", due_date: null, created_at: new Date().toISOString() },
  { id: uid(), project_id: "p2", title: "Token audit", description: "", assignee_id: "m1", status: "in_progress", priority: "medium", due_date: null, created_at: new Date().toISOString() },
  { id: uid(), project_id: "p2", title: "Motion primitives", description: "", assignee_id: "m4", status: "todo", priority: "high", due_date: null, created_at: new Date().toISOString() },
  { id: uid(), project_id: "p2", title: "Docs site scaffold", description: "", assignee_id: "m3", status: "done", priority: "medium", due_date: null, created_at: new Date().toISOString() },
  { id: uid(), project_id: "p3", title: "Hero section", description: "", assignee_id: "m2", status: "in_progress", priority: "high", due_date: null, created_at: new Date().toISOString() },
  { id: uid(), project_id: "p3", title: "Pricing page", description: "", assignee_id: "m4", status: "todo", priority: "medium", due_date: null, created_at: new Date().toISOString() },
];

function getStoreState() {
  return {
    user: { id: "u1", name: "Ava Chen", email: "ava@orbit.app" },
    projects: seedProjects,
    tasks: seedTasks,
    members: seedMembers,
  };
}

export function useStore() {
  return getStoreState();
}

export function getState() {
  return getStoreState();
}

export function addMember(member: Member) {
  seedMembers.push(member);
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const PRIORITY_RANK: Record<Priority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};