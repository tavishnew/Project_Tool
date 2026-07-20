import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import type { Project } from "../types";
import ProjectModal from "../components/ProjectModal";
import ConfirmPopover from "../components/ui/ConfirmPopover";
import Skeleton from "../components/ui/Skeleton";
import ErrorState from "../components/ui/ErrorState";
import { useToast } from "../components/ui/Toast";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  function load() {
    setLoading(true);
    setError(null);
    api
      .listProjects()
      .then(setProjects)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }

  async function handleCreate(data: { name: string; description: string; color: string }) {
    const p = await api.createProject(data);
    setProjects((prev) => [p, ...prev]);
    setShowModal(false);
    toast("Project created");
  }

  async function handleDelete(id: string) {
    await api.deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setConfirmId(null);
    toast("Project deleted");
  }

  return (
    <div className="bg-measured min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <header className="mb-12 flex items-end justify-between border-b border-ink/80 pb-5">
          <div>
            <p className="mb-1 font-mono text-[0.7rem] uppercase tracking-widest text-muted">
              Project ledger / index
            </p>
            <h1 className="font-display text-4xl font-medium tracking-tight text-ink">Ledger</h1>
            <div className="mt-1 h-0.5 w-16 bg-gold" />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-sm bg-pine px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-pine-dark active:translate-y-px focus-ring"
          >
            + New project
          </button>
        </header>

        {loading && (
          <div>
            {Array.from({ length: 4 }).map((_, i) => <Skeleton.Row key={i} />)}
          </div>
        )}

        {error && (
          <ErrorState title="Couldn't load projects" message={error} onRetry={load} />
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="tick-frame rounded-sm border border-dashed border-line px-8 py-16 text-center">
            <p className="mb-2 font-display text-lg text-ink">No projects yet</p>
            <p className="mb-5 text-sm text-muted">Every ledger starts with a first entry.</p>
            <button
              onClick={() => setShowModal(true)}
              className="rounded-sm bg-pine px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-pine-dark active:translate-y-px focus-ring"
            >
              + Start your first project
            </button>
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="flex flex-col">
            {projects.map((p, i) => {
              const pct = p.task_count ? Math.round((p.done_count / p.task_count) * 100) : 0;
              return (
                <Link
                  to={`/projects/${p.id}`}
                  key={p.id}
                  className="group flex items-center gap-4 border-b border-line py-5 opacity-0 animate-[fadeUp_0.4s_ease_forwards] focus-ring"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <span className="w-8 shrink-0 font-mono text-xs text-muted tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-display text-lg font-medium text-ink group-hover:underline underline-offset-2">
                      {p.name}
                    </h3>
                    {p.description && <p className="truncate text-sm text-muted">{p.description}</p>}
                  </div>

                  <div className="hidden w-40 shrink-0 sm:block">
                    <div className="mb-1 flex justify-between font-mono text-[0.7rem] text-muted">
                      <span>{p.done_count}/{p.task_count} done</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                      <div
                        className="h-full rounded-full bg-pine transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="relative shrink-0">
                    <button
                      onClick={(e) => { e.preventDefault(); setConfirmId(p.id); }}
                      aria-label="Delete project"
                      className="rounded-sm px-2 text-muted opacity-0 transition group-hover:opacity-100 hover:text-brick focus-ring"
                    >
                      ×
                    </button>
                    {confirmId === p.id && (
                      <ConfirmPopover
                        message="Delete this project and all its tasks?"
                        onConfirm={() => handleDelete(p.id)}
                        onCancel={() => setConfirmId(null)}
                      />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {showModal && <ProjectModal onClose={() => setShowModal(false)} onSave={handleCreate} />}
      </div>
    </div>
  );
}
