import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Filter,
  FolderKanban,
  ListTodo,
  Plus,
  RotateCcw,
  Sparkles,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/orbit/progress-ring";
import { MemberStack } from "@/components/orbit/member-avatar";
import { NewTaskDialog } from "@/components/orbit/new-task-dialog";
import { DashboardSkeleton } from "@/components/orbit/dashboard-skeleton";
import { StatusDot } from "@/components/orbit/status-dot";
import { useProjectsOverview } from "@/hooks/use-projects-overview";
import { STATUS_LABELS } from "@/types";
import { useAuth } from "@/auth";
import { useSidebarFilters } from "@/lib/sidebar-filters-context";

export const Route = createFileRoute("/app/")({
  component: DashboardPage,
});

function relativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${formatDistanceToNowStrict(date, { addSuffix: false })} ago`;
}

function DashboardPage() {
  const { user } = useAuth();
  const { filters, setFilters } = useSidebarFilters();
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const {
    projects,
    tasks,
    allTasks,
    members: membersWithColors,
    stats,
    hasActiveFilters,
    error,
    isLoading,
    refetch,
  } = useProjectsOverview({ filters, userId: user?.id });

  const recentProjects = projects.slice(0, 4);
  const recentlyCreatedTasks = [...tasks]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
  const backlogTasks = [...tasks]
    .filter((task) => task.status === "todo")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const filterLabels = [
    filters.myTasks && "My tasks",
    filters.overdue && "Overdue",
    filters.highPriority && "High priority",
  ].filter(Boolean) as string[];
  const hasProjects = projects.length > 0;
  const firstTaskState = hasProjects && allTasks.length === 0;

  const clearFilters = () => setFilters({ myTasks: false, overdue: false, highPriority: false });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-7 pb-4 sm:space-y-8">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Good to see you, {user?.name?.split(" ")[0] ?? "friend"}.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            {hasProjects
              ? "See what needs attention and keep your projects moving."
              : "Start by creating a project, then turn your plan into tasks."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasProjects && (
            <Button size="lg" className="ledger-action" onClick={() => setCreateTaskOpen(true)}>
              <FileText className="mr-2 h-4 w-4" /> New task
            </Button>
          )}
          <Button asChild size={hasProjects ? "default" : "lg"} variant={hasProjects ? "outline" : "default"} className={hasProjects ? "" : "ledger-action"}>
            <Link to="/app/projects/new">
              <Plus className="mr-2 h-4 w-4" /> New project
            </Link>
          </Button>
        </div>
      </header>

      {error && (
        <Card className="border-destructive/40 bg-destructive/5" role="alert">
          <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-foreground">Your dashboard could not be fully loaded.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your workspace data is still safe. Please try again before interpreting an empty list.
              </p>
            </div>
            <Button variant="outline" onClick={() => void refetch()}>
              <RotateCcw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {!hasProjects ? (
        <section aria-labelledby="workspace-setup-heading">
          <Card className="ledger-frame overflow-hidden border-primary/35">
            <CardContent className="grid gap-8 px-6 py-8 sm:px-8 md:grid-cols-[1.2fr_0.8fr] md:items-center md:py-10">
              <div>
                <span className="inline-flex items-center gap-2 border border-primary/25 bg-primary/10 px-3 py-1 font-ui text-xs font-bold text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> Get started
                </span>
                <h2 id="workspace-setup-heading" className="mt-4 font-display text-2xl font-semibold tracking-tight">
                  Turn your next idea into a shared project.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                  Create a project first. You can then add tasks, invite collaborators, and follow progress from one workspace.
                </p>
                <Button asChild size="lg" className="ledger-action mt-6">
                  <Link to="/app/projects/new">
                    <Plus className="mr-2 h-4 w-4" /> Create your first project
                  </Link>
                </Button>
              </div>
              <ol className="space-y-3 rounded-2xl border border-border/80 bg-background/70 p-5 text-sm">
                {[
                  ["1", "Create a project", "Give your work a clear home."],
                  ["2", "Add your first task", "Capture the next concrete step."],
                  ["3", "Invite a collaborator", "Share progress when you are ready."],
                ].map(([step, title, copy]) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{step}</span>
                    <span>
                      <span className="block font-medium text-foreground">{title}</span>
                      <span className="text-xs text-muted-foreground">{copy}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </section>
      ) : (
        <>
          {hasActiveFilters && (
            <section
              aria-live="polite"
              className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-2 text-sm sm:items-center">
                <Filter className="mt-0.5 h-4 w-4 shrink-0 text-primary sm:mt-0" />
                <span>
                  Showing <strong>{tasks.length}</strong> matching {tasks.length === 1 ? "task" : "tasks"} for {filterLabels.join(", ")}. Counts and lists below reflect this scope.
                </span>
              </div>
              <Button variant="ghost" size="sm" className="self-start text-primary sm:self-auto" onClick={clearFilters}>
                Clear filters
              </Button>
            </section>
          )}

          {firstTaskState ? (
            <section aria-labelledby="first-task-heading">
              <Card className="ledger-frame overflow-hidden border-primary/35">
                <CardContent className="grid gap-7 px-6 py-7 sm:px-8 md:grid-cols-[1.15fr_0.85fr] md:items-center md:py-9">
                  <div>
                    <span className="inline-flex items-center gap-2 border border-primary/25 bg-primary/10 px-3 py-1 font-ui text-xs font-bold text-primary">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Project ready
                    </span>
                    <h2 id="first-task-heading" className="mt-4 font-display text-2xl font-semibold tracking-tight">
                      Your project is ready for its first task.
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                      Break the work into a concrete next step. You can assign it, choose its priority, and keep the project moving from its board.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      <Button size="lg" className="ledger-action" onClick={() => setCreateTaskOpen(true)}>
                        <FileText className="mr-2 h-4 w-4" /> Create your first task
                      </Button>
                      <Button asChild variant="outline">
                        <Link to={`/app/projects/${projects[0].id}`}>
                          Open project board <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/80 bg-background/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">A simple first pass</p>
                    <div className="mt-4 space-y-4 text-sm">
                      <div className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span><p><strong>Capture the task</strong><br /><span className="text-muted-foreground">Describe the smallest valuable outcome.</span></p></div>
                      <div className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">2</span><p><strong>Choose ownership</strong><br /><span className="text-muted-foreground">Assign it now or leave it unassigned.</span></p></div>
                      <div className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">3</span><p><strong>Move it forward</strong><br /><span className="text-muted-foreground">Use the project board as work progresses.</span></p></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          ) : (
            <>
              <section aria-label={hasActiveFilters ? "Filtered workspace totals" : "Workspace totals"} className="ledger-frame overflow-hidden">
                <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
                  <p className="ledger-caption text-muted-foreground">Workspace proof</p>
                  <p className="font-ui text-xs text-muted-foreground">A compact record of the current scope</p>
                </div>
                <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
                  {stats.map((stat, index) => {
                    const tones = ["text-primary bg-primary/10 border-primary/20", "text-success bg-success/10 border-success/20", "text-warning bg-warning/10 border-warning/20", "text-destructive bg-destructive/10 border-destructive/20"];
                    return (
                      <div key={stat.label} className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
                        <div><p className="ledger-caption text-muted-foreground">{stat.label}</p><p className="mt-1 font-display text-3xl font-semibold tabular-nums">{stat.value}</p></div>
                        <span className={`flex h-8 w-8 items-center justify-center border ${tones[index % tones.length]}`}><stat.icon className="h-4 w-4" /></span>
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
                <section>
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="font-display text-xl font-semibold">Your projects</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Open a project to plan and move work forward.</p>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="shrink-0">
                      <Link to="/app/projects">View all <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {recentProjects.map((project) => {
                      const projectTasks = allTasks.filter((task) => task.project_id === project.id);
                      const doneCount = projectTasks.filter((task) => task.status === "done").length;
                      const completion = projectTasks.length ? doneCount / projectTasks.length : 0;
                      const projectMembers = membersWithColors.filter((member) => project.member_ids?.includes(member.id));

                      return (
                        <Link to={`/app/projects/${project.id}`} key={project.id} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                          <div className="ledger-panel ledger-action h-full p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <div className="mb-3 flex items-center gap-2">
                                  <span className="h-2.5 w-2.5 border border-primary-foreground/50" style={{ backgroundColor: project.color }} aria-hidden="true" />
                                  <span className="ledger-caption text-muted-foreground">Project</span>
                                </div>
                                <h3 className="font-display text-lg font-semibold">{project.name}</h3>
                                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.description || "No description yet."}</p>
                              </div>
                              <ProgressRing value={completion} />
                            </div>
                            <div className="mt-6 flex items-center justify-between gap-3">
                              <MemberStack members={projectMembers} />
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1" aria-label={`${projectMembers.length} members`}><Users className="h-3.5 w-3.5" /> {projectMembers.length}</span>
                                <span className="inline-flex items-center gap-1" aria-label={`${doneCount} of ${projectTasks.length} tasks completed`}><CheckCircle2 className="h-3.5 w-3.5" /> {doneCount}/{projectTasks.length}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>

                <section>
                  <div className="mb-4">
                    <h2 className="font-display text-xl font-semibold">Newly created tasks</h2>
                    <p className="mt-1 text-sm text-muted-foreground">The latest work added across your projects.</p>
                  </div>
                  {recentlyCreatedTasks.length === 0 ? (
                    <Card className="border-dashed border-border bg-card/70">
                      <CardContent className="py-10 text-center">
                        <ListTodo className="mx-auto h-8 w-8 text-muted-foreground" />
                        <h3 className="mt-3 font-display text-lg font-semibold">{hasActiveFilters ? "No tasks match these filters" : "No tasks to show"}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {hasActiveFilters ? "Clear a filter to broaden this view." : "Create a task to begin tracking work."}
                        </p>
                        <div className="mt-5 flex justify-center gap-2">
                          {hasActiveFilters ? (
                            <Button variant="outline" onClick={clearFilters}>Clear filters</Button>
                          ) : (
                            <Button onClick={() => setCreateTaskOpen(true)}><Plus className="mr-2 h-4 w-4" /> Create task</Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-2">
                      {recentlyCreatedTasks.map((task) => {
                        const project = projects.find((item) => item.id === task.project_id);
                        const assignee = membersWithColors.find((member) => member.id === task.assignee_id);
                        const created = relativeTime(task.created_at);
                        return (
                          <Link key={task.id} to={`/app/projects/${project?.id}`} className="ledger-task-card flex items-center justify-between gap-3 p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <div className="flex min-w-0 items-center gap-3">
                              <StatusDot status={task.status} />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{task.title}</p>
                                <p className="truncate text-xs text-muted-foreground">{project?.name ?? "Unknown project"} · {STATUS_LABELS[task.status]}</p>
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2 text-[11px] text-muted-foreground">
                              <time dateTime={task.created_at} aria-label={`Created ${created}`}>{created}</time>
                              {assignee && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[9px] font-semibold text-primary" aria-label={`Assigned to ${assignee.name}`}>{assignee.name[0]}</span>}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>

              <section>
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="font-display text-xl font-semibold">To do</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Unstarted tasks across your projects. Open a project board to move work forward.</p>
                  </div>
                  <Button variant="outline" onClick={() => setCreateTaskOpen(true)} className="self-start sm:self-auto"><Plus className="mr-2 h-4 w-4" /> Add task</Button>
                </div>
                {backlogTasks.length === 0 ? (
                  <Card className="border-dashed border-border bg-card/70">
                    <CardContent className="flex flex-col items-center justify-center gap-3 py-8 text-center sm:flex-row sm:text-left">
                      <ListTodo className="h-7 w-7 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{hasActiveFilters ? "No unstarted tasks match these filters." : "No unstarted tasks yet. Create a task to capture the next step."}</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-2 lg:grid-cols-2">
                    {backlogTasks.slice(0, 8).map((task) => {
                      const project = projects.find((item) => item.id === task.project_id);
                      const created = relativeTime(task.created_at);
                      return (
                        <Link key={task.id} to={`/app/projects/${project?.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-card/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          <div className="flex min-w-0 items-center gap-3">
                            <StatusDot status={task.status} />
                            <div className="min-w-0"><p className="truncate text-sm font-medium">{task.title}</p><p className="truncate text-xs text-muted-foreground">{project?.name ?? "Unknown project"}</p></div>
                          </div>
                          <time dateTime={task.created_at} aria-label={`Created ${created}`} className="shrink-0 text-[11px] text-muted-foreground">{created}</time>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}
        </>
      )}

      <NewTaskDialog open={createTaskOpen} onOpenChange={setCreateTaskOpen} projects={projects} members={membersWithColors} />
    </div>
  );
}
