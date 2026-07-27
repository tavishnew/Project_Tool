import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { api } from '@/api';
import type { Project, Task, Member, ProjectStatus } from '@/types';

export function useProjectsOverview() {
  // Fetch projects
  const { data: projectsData, isLoading: isProjectsLoading, error: projectsError } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.listProjects(),
  });

  // Fetch all tasks for the projects (dependent on projects)
  const { data: tasksData, isLoading: isTasksLoading, error: tasksError } = useQuery({
    queryKey: ['tasks', projectsData?.projects?.map(p => p.id) ?? []],
    queryFn: async () => {
      const projects = projectsData?.projects ?? [];
      if (projects.length === 0) return { tasks: [] };
      const tasksPromises = projects.map(p => api.listTasks(p.id));
      const results = await Promise.all(tasksPromises);
      const allTasks = results.flatMap(r => r.tasks ?? []);
      return { tasks: allTasks };
    },
    enabled: !!projectsData?.projects?.length,
  });

  // Fetch members
  const { data: membersData, isLoading: isMembersLoading, error: membersError } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const response = await api.listMembers();
      return response.members ?? [];
    },
  });

  // Process members to add colors
  const membersWithColors: Member[] = (membersData ?? []).map((member, index) => ({
    ...member,
    color: member.color ?? generateMemberColor(member.name, index),
  }));

  // Flatten projects and tasks
  const projects = projectsData?.projects ?? [];
  const tasks = tasksData?.tasks ?? [];

  // Calculate stats
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const done = tasks.filter(t => t.status === 'done').length;
  const openTasks = tasks.length - done;

  const stats = {
    totalProjects: projects.length,
    openTasks,
    inProgress,
    completed: done,
  };

  return {
    projects,
    tasks,
    members: membersData ?? [],
    membersWithColors,
    stats,
    recentProjects: [] as Project[],
    recentTasks: [] as Task[],
    backlogTasks: [] as Task[],
    isLoading: isProjectsLoading || isTasksLoading || isMembersLoading,
  };
}

function generateMemberColor(name: string, fallbackIndex: number): string {
  const colors = [
    '#ff5a4e', // coral (primary)
    '#f59e0b', // amber
    '#10b981', // emerald
    '#6366f1', // indigo
    '#ec4899', // pink
    '#0ea5e9', // sky
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
