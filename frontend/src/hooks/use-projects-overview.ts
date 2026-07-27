import { useQuery } from "@tanstack/react-query";
import { FolderKanban, Clock, CheckCircle2 } from "lucide-react";
import { api } from "@/api";
import type { Member, Project, Task } from "@/types";

const MEMBER_COLORS = ["#ff5a4e", "#f59e0b", "#10b981", "#6366f1", "#ec4899", "#0ea5e9"];

export function generateMemberColor(name: string, fallbackIndex: number) {
  if (!name) return MEMBER_COLORS[fallbackIndex % MEMBER_COLORS.length];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return MEMBER_COLORS[Math.abs(hash) % MEMBER_COLORS.length];
}

export function useProjectsOverview() {
  const {
    data: projectsData,
    isLoading: projectsLoading,
    error: projectsError,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.listProjects(),
  });

  const projects: Project[] = projectsData?.projects ?? [];

  const {
    data: tasksData,
    isLoading: tasksLoading,
    error: tasksError,
  } = useQuery({
    queryKey: ["tasks", projects.map((p) => p.id)],
    queryFn: async () => {
      if (projects.length === 0) return { tasks: [] as Task[] };
      const results = await Promise.all(projects.map((p) => api.listTasks(p.id)));
      return { tasks: results.flatMap((r) => r.tasks ?? []) };
    },
    enabled: !!projects.length,
  });

  // Independent of projects so it starts in parallel on mount.
  const {
    data: membersData,
    isLoading: membersLoading,
    error: membersError,
  } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const response = await api.listMembers();
      return response.members ?? [];
    },
  });

  const tasks: Task[] = tasksData?.tasks ?? [];
  const members: Member[] = (membersData ?? []).map((member, index) => ({
    ...member,
    color: member.color || generateMemberColor(member.name, index),
  }));

  const done = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;

<<<<<<< HEAD
  const stats = [
    { label: "Projects", value: projects.length, icon: FolderKanban, color: "text-primary" },
    { label: "Open tasks", value: tasks.length - done, icon: Clock, color: "text-warning" },
    { label: "In progress", value: inProgress, icon: FolderKanban, color: "text-info" },
    { label: "Completed", value: done, icon: CheckCircle2, color: "text-success" },
  ];
=======
  // Calculate stats
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const done = tasks.filter(t => t.status === 'done').length;
  const openTasks = tasks.length - done;
  const totalProjects = projects.length;
>>>>>>> fe93335 (feat: complete useProjectsOverview hook for Task 1)

  return {
    projects,
    tasks,
<<<<<<< HEAD
    members,
    stats,
    isLoading: projectsLoading || tasksLoading || membersLoading,
    error: projectsError || tasksError || membersError,
  };
}
=======
    members: membersWithColors,
    isLoading,
    stats: [
      { label: 'Projects', value: totalProjects, icon: 'FolderKanban', color: 'text-primary' },
      { label: 'Open tasks', value: openTasks, icon: 'Clock', color: 'text-warning' },
      { label: 'In progress', value: inProgress, icon: 'FolderKanban', color: 'text-info' },
      { label: 'Completed', value: done, icon: 'CheckCircle2', color: 'text-success' },
    ],
    recentProjects: projects.slice(0, 4),
    recentTasks: [...tasks]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5),
    backlogTasks: [...tasks]
      .filter((t) => t.status === 'todo')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
  };
}

function generateMemberColor(name: string, fallbackIndex: number) {
  const colors = ['#ff5a4e', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#0ea5e9'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
>>>>>>> fe93335 (feat: complete useProjectsOverview hook for Task 1)
