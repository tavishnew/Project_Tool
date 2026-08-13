import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, FolderKanban, Plus, Users } from "lucide-react";
import { api } from "@/api";
import { Button } from "@/components/ui/button";
import type { Project } from "@/types";

export const Route = createFileRoute("/app/projects/")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.listProjects()
      .then((result) => {
        if (active) setProjects(result.projects || []);
      })
      .catch(() => {
        if (active) setProjects([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Loading projects…</div>;
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7 pb-6">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="ledger-kicker">Workspace / project index</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">Projects</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">Organize work, follow progress, and keep your team aligned.</p>
        </div>
        <Link to="/app/projects/new"><Button className="ledger-action"><Plus className="mr-2 h-4 w-4" /> Create project</Button></Link>
      </header>

      {projects.length === 0 ? (
        <section className="ledger-frame flex min-h-[360px] flex-col items-center justify-center border-dashed px-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center border border-primary/30 bg-primary/10 text-primary"><FolderKanban className="h-7 w-7" /></span>
          <h2 className="mt-5 font-display text-xl font-semibold">Start your first project</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Create a project to set up a focused task board, invite collaborators, and track progress in one place.</p>
          <Link to="/app/projects/new" className="mt-6"><Button className="ledger-action"><Plus className="mr-2 h-4 w-4" /> Create a project</Button></Link>
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Project list">
          {projects.map((project) => {
            const total = project.task_count || 0;
            const complete = project.done_count || 0;
            const progress = total ? Math.round((complete / total) * 100) : 0;
            const isComplete = project.status === "completed";

            return (
              <Link
                key={project.id}
                to="/app/projects/$id"
                params={{ id: project.id }}
                className="ledger-panel ledger-action group relative overflow-hidden p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 border border-primary-foreground/50" style={{ backgroundColor: project.color || "#A0522D" }} /><span className={isComplete ? "border border-success/35 bg-success/10 px-2 py-0.5 font-ui text-[11px] font-bold text-success" : "border border-primary/25 bg-primary/5 px-2 py-0.5 font-ui text-[11px] font-bold text-primary"}>
                    {isComplete ? "Completed" : "Active"}
                  </span></div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
                </div>
                <h2 className="mt-5 truncate font-display text-xl font-semibold">{project.name}</h2>
                <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">{project.description || "No description yet. Open the project to add tasks and start planning work."}</p>

                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between font-ui text-xs font-semibold text-muted-foreground"><span>Progress</span><span className="tabular-nums">{progress}%</span></div>
                  <div className="h-2 overflow-hidden border border-border bg-muted"><div className="h-full transition-all" style={{ width: `${progress}%`, backgroundColor: project.color || "#A0522D" }} /></div>
                </div>

                <div className="mt-5 flex items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" />{complete}/{total || 0} tasks</span>
                  <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{project.member_count || 1}</span>
                </div>
              </Link>
            );
          })}
        </section>
      )}
    </div>
  );
}
