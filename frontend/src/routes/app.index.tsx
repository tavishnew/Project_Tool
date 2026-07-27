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
import { DashboardSkeleton } from "@/components/orbit/dashboard-skeleton";
import { StatusDot } from "@/components/orbit/status-dot";
import { useProjectsOverview } from "@/hooks/use-projects-overview";
import { STATUS_LABELS } from "@/types";
import { useAuth } from "@/auth";

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
  const [createTaskOpen, setCreateTaskOpen] = useState(false);

  const { projects, tasks, members: membersWithColors, stats, isLoading } = useProjectsOverview();

  // Recent projects (last 4)
  const recentProjects = projects.slice(0, 4);

  // Recent tasks (last 5, sorted by created date)
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Backlog tasks (tasks with "todo" status)
  const backlogTasks = [...tasks]
    .filter((t) => t.status === "todo")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
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
            Good to see you, {user?.name?.split(" ")[0] ?? "friend"}.
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full" onClick={() => setCreateTaskOpen(true)}>
            <FileText className="mr-2 h-4 w-4" /> New task
          </Button>
          <Link to="/app/projects/new">
            <Button size="lg" className="rounded-full">
              <Plus className="mr-2 h-4 w-4" /> New project
            </Button>
          </Link>
        </div>
      </header>

      {/* Stats Row */}
      <section aria-label="Stats" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Card key={s.label} className="border-border bg-card/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </span>
              </div>
              <div className="mt-3 font-display text-3xl font-bold tracking-tight">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </section>

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
                const pMembers = membersWithColors.filter((m) =>
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
                );
              })}
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
      </div>

      <NewTaskDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        projects={projects}
        members={membersWithColors}
      />
    </div>
  );
}