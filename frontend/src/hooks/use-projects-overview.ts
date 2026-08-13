import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, FolderKanban } from "lucide-react";
import { api } from "@/api";
import type { Member, Project, Task } from "@/types";

const MEMBER_COLORS = ["#ff5a4e", "#f59e0b", "#10b981", "#6366f1", "#ec4899", "#0ea5e9"];

export interface DashboardFilters {
  myTasks: boolean;
  overdue: boolean;
  highPriority: boolean;
}

interface ProjectsOverviewOptions {
  filters?: DashboardFilters;
  userId?: string;
}

export function generateMemberColor(name: string, fallbackIndex: number) {
  if (!name) return MEMBER_COLORS[fallbackIndex % MEMBER_COLORS.length];

  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = name.charCodeAt(index) + ((hash << 5) - hash);
  }
  return MEMBER_COLORS[Math.abs(hash) % MEMBER_COLORS.length];
}

function isOverdue(task: Task) {
  if (!task.due_date || task.status === "done") return false;

  const dueDate = new Date(task.due_date);
  if (Number.isNaN(dueDate.getTime())) return false;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return dueDate.getTime() < startOfToday.getTime();
}

export function useProjectsOverview({ filters, userId }: ProjectsOverviewOptions = {}) {
  const {
    data: projectsData,
    isLoading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.listProjects(),
  });

  const projects: Project[] = projectsData?.projects ?? [];
  const projectIds = projects.map((project) => project.id);

  const {
    data: tasksData,
    isLoading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useQuery({
    queryKey: ["tasks", projectIds],
    queryFn: async () => {
      const results = await Promise.all(projects.map((project) => api.listTasks(project.id)));
      return { tasks: results.flatMap((result) => result.tasks ?? []) as Task[] };
    },
    enabled: projects.length > 0,
  });

  const {
    data: membersData,
    isLoading: membersLoading,
    error: membersError,
    refetch: refetchMembers,
  } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const response = await api.listMembers();
      return response.members ?? [];
    },
  });

  const allTasks: Task[] = tasksData?.tasks ?? [];
  const members: Member[] = (membersData ?? []).map((member, index) => ({
    ...member,
    color: member.color || generateMemberColor(member.name, index),
  }));

  const activeFilters: DashboardFilters = filters ?? {
    myTasks: false,
    overdue: false,
    highPriority: false,
  };
  const hasActiveFilters = Object.values(activeFilters).some(Boolean);

  const tasks = allTasks.filter((task) => {
    if (activeFilters.myTasks && task.assignee_id !== userId) return false;
    if (activeFilters.overdue && !isOverdue(task)) return false;
    if (activeFilters.highPriority && !["high", "urgent"].includes(task.priority)) return false;
    return true;
  });

  const done = tasks.filter((task) => task.status === "done").length;
  const inProgress = tasks.filter((task) => task.status === "in_progress").length;
  const stats = [
    { label: "Projects", value: projects.length, icon: FolderKanban, color: "text-primary" },
    { label: hasActiveFilters ? "Matching tasks" : "Open tasks", value: tasks.length - done, icon: Clock, color: "text-warning" },
    { label: "In progress", value: inProgress, icon: FolderKanban, color: "text-info" },
    { label: "Completed", value: done, icon: CheckCircle2, color: "text-success" },
  ];

  const refetch = async () => {
    await Promise.all([refetchProjects(), refetchTasks(), refetchMembers()]);
  };

  return {
    projects,
    tasks,
    allTasks,
    members,
    stats,
    hasActiveFilters,
    generateMemberColor,
    isLoading: projectsLoading || tasksLoading || membersLoading,
    isProjectsLoading: projectsLoading,
    isTasksLoading: tasksLoading,
    isMembersLoading: membersLoading,
    error: projectsError || tasksError || membersError,
    projectsError,
    tasksError,
    membersError,
    refetch,
  };
}
