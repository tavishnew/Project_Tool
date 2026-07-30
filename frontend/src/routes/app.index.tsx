<<<<<<< HEAD
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FolderKanban, Clock, CheckCircle2, Users, FileText } from "lucide-react";
import { ProgressRing } from "@/components/orbit/progress-ring";
import { MemberStack } from "@/components/orbit/member-avatar";
import { SpotlightCard } from "@/components/orbit/spotlight-card";
import { NewTaskDialog } from "@/components/orbit/new-task-dialog";
<<<<<<< HEAD
import { DashboardSkeleton } from "@/components/orbit/dashboard-skeleton";
import { StatusDot } from "@/components/orbit/status-dot";
import { useProjectsOverview } from "@/hooks/use-projects-overview";
import { STATUS_LABELS } from "@/types";
=======
import { useProjectsOverview } from "@/hooks/use-projects-overview";
import type { Project, Task, Member } from "@/types";
>>>>>>> c114262 (api fixed)
=======
import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { api } from "@/api";
import { MemberAvatar } from "@/components/orbit/member-avatar";
import { TaskDialog } from "@/components/orbit/task-dialog";
import { KanbanColumn } from "@/components/orbit/kanban-column";
import { SidebarFilters } from "@/components/orbit/sidebar-filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Task, TaskStatus, Project, Member } from "@/types";
>>>>>>> 2766c08 (final updates)
import { useAuth } from "@/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Kanban, UserPlus, Trash2, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useSidebarFilters } from "@/lib/sidebar-filters-context";

export const Route = createFileRoute("/app/")({
  component: DashboardPage,
});

<<<<<<< HEAD
function relativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${formatDistanceToNowStrict(date, { addSuffix: false })} ago`;
}

function DashboardPage() {
  const { user } = useAuth();
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
<<<<<<< HEAD

  const { projects, tasks, members: membersWithColors, stats, isLoading } = useProjectsOverview();
=======
  const {
    projects,
    tasks,
    members,
    stats,
    isLoading,
    generateMemberColor,
  } = useProjectsOverview();
>>>>>>> c114262 (api fixed)
=======
const STATUS_KEYS: TaskStatus[] = ["todo", "in_progress", "review", "done"];

function DashboardPage() {
  const { user } = useAuth();
  const { filters: sidebarFilters, setFilters: setSidebarFilters } = useSidebarFilters();
  const [openTask, setOpenTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);
  const [addingIn, setAddingIn] = useState<TaskStatus | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | "all">("all");
  const [activeTab, setActiveTab] = useState<string>("tasks");
  // Members tab state
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [showAddProjectDialog, setShowAddProjectDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectColor, setNewProjectColor] = useState("#6366f1");
  const [creatingProject, setCreatingProject] = useState(false);
>>>>>>> 2766c08 (final updates)

  async function fetchAll() {
    setLoading(true);
    try {
      const [projectsRes, membersRes] = await Promise.all([
        api.listProjects(),
        api.listMembers(),
      ]);
      setProjects(projectsRes.projects ?? []);
      setMembers(membersRes.members ?? []);

      // Fetch all tasks across all projects
      const projectIds = projectsRes.projects?.map((p: Project) => p.id) ?? [];
      if (projectIds.length > 0) {
        const allTasks = await Promise.all(
          projectIds.map((id: string) => api.listTasks(id))
        );
        const flattened = allTasks.flatMap((r) => r.tasks ?? []);
        setTasks(flattened);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function fetchProjectTasks(projectId: string) {
    try {
      const res = await api.listTasks(projectId);
      setTasks(res.tasks ?? []);
    } catch (err) {
      console.error("Failed to load project tasks", err);
      toast.error("Failed to load tasks");
    }
  }

<<<<<<< HEAD
  if (isLoading) {
<<<<<<< HEAD
    return <DashboardSkeleton />;
=======
=======
  // Initial load
  useEffect(() => {
    fetchAll();
  }, []);

  // Fetch tasks when selected project changes
  useEffect(() => {
    if (selectedProjectId === "all") {
      fetchAll();
    } else {
      fetchProjectTasks(selectedProjectId);
    }
  }, [selectedProjectId]);

  // Build lookup maps
  const projectColorMap = useMemo(
    () => new Map(projects.map((p) => [p.id, p.color || "#6366f1"])),
    [projects]
  );
  const projectNameMap = useMemo(
    () => new Map(projects.map((p) => [p.id, p.name])),
    [projects]
  );
  const assigneeMap = useMemo(
    () => new Map(members.map((m) => [m.id, { id: m.id, name: m.name }])),
    [members]
  );

  // Apply sidebar filters
  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (sidebarFilters.myTasks && user) {
      result = result.filter((t) => t.assignee_id === user.id);
    }
    if (sidebarFilters.overdue) {
      const now = new Date();
      result = result.filter(
        (t) => t.due_date && new Date(t.due_date) < now && t.status !== "done"
      );
    }
    if (sidebarFilters.highPriority) {
      result = result.filter((t) => t.priority === "high" || t.priority === "urgent");
    }
    return result;
  }, [tasks, sidebarFilters, user]);

  const grouped = STATUS_KEYS.map((status) => ({
    status,
    items: filteredTasks.filter((t) => t.status === status),
  }));

  async function onDragStart(e: React.DragEvent, taskId: string, projectId: string) {
    e.dataTransfer.setData("text/plain", JSON.stringify({ taskId, projectId }));
    e.dataTransfer.effectAllowed = "move";
  }

  async function onDrop(e: React.DragEvent, status: TaskStatus) {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      const { taskId } = data;
      if (taskId) {
        await api.updateTask(taskId, { status } as any);
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
      }
    } catch {
      toast.error("Failed to move task");
    }
    setDragOver(null);
  }

  async function addTask(status: TaskStatus) {
    if (!newTitle.trim()) {
      setAddingIn(null);
      return;
    }
    const projectId = selectedProjectId === "all" ? projects[0]?.id : selectedProjectId;
    if (!projectId) return;

    try {
      await api.createTask(projectId, { title: newTitle.trim(), status, priority: "medium" });
      setNewTitle("");
      setAddingIn(null);
      fetchAll();
    } catch {
      toast.error("Failed to create task");
    }
  }

  async function handleUpdate(taskId: string, data: Partial<Task>) {
    await api.updateTask(taskId, data as any);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...data } : t)));
  }

  async function handleDelete(taskId: string) {
    await api.deleteTask(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }

  // Members tab functions
  async function handleInvite() {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await api.createWorkspaceInvite(inviteEmail.trim());
      toast.success("Invitation sent!");
      setInviteEmail("");
      setShowInviteDialog(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to send invite");
    } finally {
      setInviting(false);
    }
  }

  async function handleRemoveMember(memberId: string) {
    try {
      await api.removeMember(memberId);
      toast.success("Member removed");
      fetchAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove member");
    }
  }

  async function handleCreateProject() {
    if (!newProjectName.trim()) return;
    setCreatingProject(true);
    try {
      await api.createProject(newProjectName.trim(), newProjectDesc.trim(), newProjectColor);
      toast.success("Project created!");
      setNewProjectName("");
      setNewProjectDesc("");
      setNewProjectColor("#6366f1");
      setShowAddProjectDialog(false);
      fetchAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to create project");
    } finally {
      setCreatingProject(false);
    }
  }

  if (loading) {
>>>>>>> 2766c08 (final updates)
    return (
      <div className="space-y-8">
        <header>
          <p className="text-sm text-muted-foreground">Loading…</p>
        </header>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STATUS_KEYS.map((status) => (
            <div key={status} className="flex min-h-[400px] flex-col rounded-2xl border border-border bg-card/80 p-3 animate-pulse">
              <div className="mb-3 h-6 w-1/3 bg-muted rounded" />
              <div className="flex-1 space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 w-full bg-muted rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
>>>>>>> c114262 (api fixed)
  }

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Projects
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Project Switcher */}
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.name}
                  </span>
                </SelectItem>
              ))}
              <SelectItem value="new" className="text-primary font-medium">
                <Plus className="mr-2 h-4 w-4" /> New Project…
              </SelectItem>
            </SelectContent>
          </Select>

          {/* New Task Button */}
          {selectedProjectId !== "all" && selectedProjectId !== "new" && (
            <Button size="lg" className="rounded-full" onClick={() => setAddingIn("todo")}>
              <Plus className="mr-2 h-4 w-4" /> New Task
            </Button>
          )}

          {/* New Project Button */}
          <Button size="lg" className="rounded-full" onClick={() => setShowAddProjectDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border" data-testid="dashboard-tabs">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tasks">
              <Kanban className="mr-2 h-4 w-4" /> Tasks
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="mr-2 h-4 w-4" /> Members
            </TabsTrigger>
          </TabsList>

<<<<<<< HEAD
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Projects */}
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Your projects</h2>
            <Link to="/app/projects" className="text-sm text-muted-foreground hover:text-foreground">
              View all →
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <Card className="border-dashed border-border bg-card/70">
              <CardContent className="pt-16 pb-16 text-center">
                <FolderKanban className="mx-auto h-8 w-8 text-muted-foreground" />
                <h3 className="mt-3 font-display text-lg font-semibold">No projects yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Kick things off with your first project.</p>
                <Link to="/app/projects/new">
                  <Button className="mt-6 rounded-full">
                    <Plus className="mr-2 h-4 w-4" /> Create project
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {recentProjects.map((project, i) => {
                const pTasks = tasks.filter((t) => t.project_id === project.id);
                const doneCount = pTasks.filter((t) => t.status === "done").length;
                const pct = pTasks.length ? doneCount / pTasks.length : 0;
                const pMembers = members.filter((m) =>
                  project.member_ids?.includes(m.id)
                );

                return (
                  <Link to={`/app/projects/${project.id}`} key={project.id}>
                    <SpotlightCard className="h-full">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="mb-3 flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: project.color }}
                            />
                            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Project
                            </span>
                          </div>
                          <h3 className="font-display text-lg font-semibold">{project.name}</h3>
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {project.description}
                          </p>
                        </div>
                        <ProgressRing value={pct} />
                      </div>
                      <div className="mt-6 flex items-center justify-between">
                        <MemberStack members={pMembers} />
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" /> {pMembers.length}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> {doneCount}/{pTasks.length}
                          </span>
                        </div>
                      </div>
                    </SpotlightCard>
                  </Link>
                })
              </div>
            )}
          </section>

          {/* Recent Tasks & Quick Actions */}
          <section className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-semibold">Recent tasks</h2>
              {recentTasks.length === 0 ? (
                <Card className="border-dashed border-border bg-card/70 mt-4">
                  <CardContent className="py-12 text-center">
                    <Clock className="mx-auto h-8 w-8 text-muted-foreground" />
                    <h3 className="mt-3 font-display text-lg font-semibold">No tasks yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Create a project and add your first task.</p>
                    <Link to="/app/projects/new">
                      <Button className="mt-4 rounded-full">
                        <Plus className="mr-2 h-4 w-4" /> Create project
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="mt-4 space-y-2">
                  {recentTasks.map((task) => {
                    const project = projects.find((p) => p.id === task.project_id);
                    const assignee = members.find((m) => m.id === task.assignee_id);
                    return (
                      <Link
                        key={task.id}
                        to={`/app/projects/${project?.id}`}
                        className="flex items-center justify-between rounded-xl border border-border bg-card p-3 hover:bg-card/80 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`h-2 w-2 rounded-full flex-shrink-0 ${
                              task.status === "done"
                                ? "bg-success"
                                : task.status === "in_progress"
                                ? "bg-info"
                                : task.status === "review"
                                ? "bg-warning"
                                : "bg-muted-foreground/40"
                            }`}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{task.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {project?.name ?? "Unknown project"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            {assignee && (
                              <div
                                className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-semibold text-primary"
                              >
                                {assignee.name[0]}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

<<<<<<< HEAD
        {/* Recent Tasks & Quick Actions */}
        <section className="space-y-6">
          <div>
            <h2 className="font-display text-xl font-semibold">Recent tasks</h2>
            {recentTasks.length === 0 ? (
              <Card className="border-dashed border-border bg-card/70 mt-4">
                <CardContent className="py-12 text-center">
                  <Clock className="mx-auto h-8 w-8 text-muted-foreground" />
                  <h3 className="mt-3 font-display text-lg font-semibold">No tasks yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Create a project and add your first task.</p>
                  <Link to="/app/projects/new">
                    <Button className="mt-4 rounded-full">
                      <Plus className="mr-2 h-4 w-4" /> Create project
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="mt-4 space-y-2">
                {recentTasks.map((task) => {
                  const project = projects.find((p) => p.id === task.project_id);
                  const assignee = membersWithColors.find((m) => m.id === task.assignee_id);
                  return (
                    <Link
                      key={task.id}
                      to={`/app/projects/${project?.id}`}
                      className="flex items-center justify-between rounded-xl border border-border bg-card p-3 hover:bg-card/80 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <StatusDot status={task.status} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {project?.name ?? "Unknown project"} · {STATUS_LABELS[task.status]}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <time dateTime={task.created_at} className="whitespace-nowrap">
                          {relativeTime(task.created_at)}
                        </time>
                        {assignee && (
                          <div
                            className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-semibold text-primary"
                          >
                            {assignee.name[0]}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Backlog */}
          <div>
            <h2 className="font-display text-xl font-semibold">Backlog (all projects)</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Unstarted tasks across every project — open a project board to work them.
            </p>
            {backlogTasks.length === 0 ? (
              <Card className="border-dashed border-border bg-card/70 mt-4">
                <CardContent className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">No backlog tasks. Create a task and set to "To Do" status.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="mt-4 space-y-2">
                {backlogTasks.map((task) => {
                  const project = projects.find((p) => p.id === task.project_id);
                  const assignee = membersWithColors.find((m) => m.id === task.assignee_id);
                  return (
                    <Link
                      key={task.id}
                      to={`/app/projects/${project?.id}`}
                      className="flex items-center justify-between rounded-xl border border-border bg-card p-3 hover:bg-card/80 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <StatusDot status={task.status} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {project?.name ?? "Unknown project"} · {STATUS_LABELS[task.status]}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <time dateTime={task.created_at} className="whitespace-nowrap">
                          {relativeTime(task.created_at)}
                        </time>
                        {assignee && (
                          <div
                            className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-semibold text-primary"
                          >
                            {assignee.name[0]}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
=======
            {/* Backlog */}
            <div>
              <h2 className="font-display text-xl font-semibold">Backlog</h2>
              {backlogTasks.length === 0 ? (
                <Card className="border-dashed border-border bg-card/70 mt-4">
                  <CardContent className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">No backlog tasks. Create a task and set to "To Do" status.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="mt-4 space-y-2">
                  {backlogTasks.map((task) => {
                    const project = projects.find((p) => p.id === task.project_id);
                    const assignee = members.find((m) => m.id === task.assignee_id);
                    return (
                      <Link
                        key={task.id}
                        to={`/app/projects/${project?.id}`}
                        className="flex items-center justify-between rounded-xl border border-border bg-card p-3 hover:bg-card/80 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="h-2 w-2 rounded-full flex-shrink-0 bg-muted-foreground/40" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{task.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{project?.name ?? "Unknown project"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          {assignee && (
                            <div
                              className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-semibold text-primary"
                            >
                              {assignee.name[0]}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
>>>>>>> c114262 (api fixed)

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-3" onClick={() => setCreateTaskOpen(true)}>
                  <FileText className="h-4 w-4" />
                  <span>Create new task</span>
                </Button>
                <Link to="/app/projects/new">
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <FolderKanban className="h-4 w-4" />
                    <span>Create new project</span>
                  </Button>
                </Link>
                <Link to="/app/projects">
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <FolderKanban className="h-4 w-4" />
                    <span>View all projects</span>
                  </Button>
                </Link>
                <Link to="/app/members">
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <Users className="h-4 w-4" />
                    <span>Manage members</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>
=======
          {/* Tab Content */}
          <TabsContent value="tasks" className="mt-4">
        {/* Kanban Board */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {grouped.map(({ status, items }) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={items}
              projectColorMap={projectColorMap}
              projectNameMap={projectNameMap}
              assigneeMap={assigneeMap}
              dragOver={dragOver === status}
              onDragOver={(e) => { e.preventDefault(); setDragOver(status); }}
              onDragLeave={() => setDragOver((s) => (s === status ? null : s))}
              onDrop={(e) => onDrop(e, status)}
              onOpenTask={setOpenTask}
              onDragStart={onDragStart}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onAddTask={addTask}
              addingIn={addingIn}
              newTitle={newTitle}
              setNewTitle={setNewTitle}
              setAddingIn={setAddingIn}
              projectId={selectedProjectId}
            />
          ))}
>>>>>>> 2766c08 (final updates)
        </div>

        {/* Task Dialog */}
        <TaskDialog
          task={openTask}
          members={members}
          onClose={() => setOpenTask(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </TabsContent>

      <TabsContent value="members" className="mt-4">
        {/* Members Management */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-semibold">Workspace Members</h2>
              <p className="text-sm text-muted-foreground">
                Manage who has access to this workspace
              </p>
            </div>
            <Button size="lg" className="rounded-full" onClick={() => setShowInviteDialog(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> Invite Member
            </Button>
          </div>

          {members.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/70 p-16 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-display text-lg font-semibold">No members yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Invite your team to start collaborating.</p>
              <Button className="mt-6 rounded-full" onClick={() => setShowInviteDialog(true)}>
                <UserPlus className="mr-2 h-4 w-4" /> Invite Member
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
                >
                  <MemberAvatar
                    member={{
                      id: member.id,
                      name: member.name,
                      color: member.color || "#6366f1",
                    }}
                    size={40}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{member.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Member
                    </span>
                  </div>
                  {member.id !== user?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </TabsContent>
        </Tabs>
      </div>

      {/* Invite Member Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-md" data-testid="invite-member-dialog">
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogDescription>
              Enter their email address. They will receive an invitation to join the workspace.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleInvite(); }}>
            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="invite-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    className="pl-10"
                    placeholder="colleague@example.com"
                    autoFocus
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-full" disabled={inviting}>
                {inviting ? "Sending..." : <><Mail className="mr-2 h-4 w-4" /> Send Invite</>}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Project Dialog */}
      <Dialog open={showAddProjectDialog} onOpenChange={setShowAddProjectDialog}>
        <DialogContent className="max-w-md" data-testid="add-project-dialog">
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
            <DialogDescription>
              Create a new project to organize your tasks.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleCreateProject(); }}>
            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="project-name">Name</Label>
                <Input
                  id="project-name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  required
                  placeholder="Project name"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="project-desc">Description (optional)</Label>
                <Input
                  id="project-desc"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="What's this project about?"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Color</Label>
                <div className="flex items-center gap-2">
                  {["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewProjectColor(color)}
                      className={`h-8 w-8 rounded-lg border-2 transition-transform ${
                        newProjectColor === color ? "border-primary scale-110" : "border-transparent hover:border-border"
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={color}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAddProjectDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-full" disabled={creatingProject}>
                {creatingProject ? "Creating..." : <><Kanban className="mr-2 h-4 w-4" />Create Project</>}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}