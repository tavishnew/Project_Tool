import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Plus, FolderKanban, CheckCircle2, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/auth";
import { api } from "@/api";
import { useToast } from "@/components/Toast";
import { ProgressRing } from "@/components/orbit/ProgressRing";
import { MemberStack, type Member } from "@/components/orbit/MemberAvatar";
import { SpotlightCard } from "@/components/orbit/SpotlightCard";
import { useStore } from "@/lib/mock-store";
import NewProjectDialog from "@/components/NewProjectDialog";

export default function ProjectsPage() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const { notify } = useToast();
  const { projects, tasks, members } = useStore();
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const done = tasks.filter((t) => t.status === "done").length;
  const openTasks = tasks.length - done;

  const stats = [
    { label: "Projects", value: projects.length, icon: FolderKanban },
    { label: "Open tasks", value: openTasks, icon: Clock },
    { label: "In progress", value: inProgress, icon: FolderKanban },
    { label: "Completed", value: done, icon: CheckCircle2 },
  ];

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    try {
      await api.deleteProject(id);
      refresh();
      notify("Project deleted");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Failed to delete project");
    }
  };

  const orbitMembers: Member[] = members.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    color: m.color ?? "#6366f1",
    role: m.isOwner ? "owner" : "member",
  }));

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">Good to see you, {user?.name?.split(" ")[0] ?? "friend"}.</h1>
        </div>
        <Button size="lg" className="rounded-full" onClick={() => setNewProjectOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New project
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><s.icon className="h-4 w-4" /></span>
            </div>
            <div className="mt-3 font-display text-3xl font-bold tracking-tight">{s.value}</div>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Your projects</h2>
          <span className="text-sm text-muted-foreground">{projects.length} total</span>
        </div>
        {projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/70 p-16 text-center empty-state">
            <h3 className="font-display text-lg font-semibold">No projects yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Kick things off with your first project.</p>
            <Button className="mt-6 rounded-full" onClick={() => setNewProjectOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create project
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((p, i) => {
              const pTasks = tasks.filter((t) => t.project_id === p.id);
              const doneCount = pTasks.filter((t) => t.status === "done").length;
              const pct = pTasks.length ? doneCount / pTasks.length : 0;
              const pMembers = orbitMembers.filter((m) => p.memberIds?.includes(m.id));

              return (
                <Link key={p.id} to={`/projects/${p.id}`} className="block animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <SpotlightCard className="h-full p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Project</span>
                        </div>
                        <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                      </div>
                      <ProgressRing value={pct} />
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <MemberStack members={pMembers} />
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {pMembers.length}</span>
                        <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> {doneCount}/{pTasks.length}</span>
                      </div>
                    </div>
                  </SpotlightCard>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {newProjectOpen && (
        <NewProjectDialog
          onClose={() => setNewProjectOpen(false)}
          onCreate={async (data) => {
            const { project } = await api.createProject(data.name, data.description);
            refresh();
            notify("Project created");
            navigate(`/projects/${project.id}`);
          }}
        />
      )}
    </div>
  );
}