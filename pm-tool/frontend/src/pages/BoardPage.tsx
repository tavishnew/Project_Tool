import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import type { ProjectDetail, Task, TaskStatus } from "../types";
import Column from "../components/Column";
import TaskModal from "../components/TaskModal";
import { Skeleton } from "../components/ui/Skeleton";
import ErrorState from "../components/ui/ErrorState";
import { useToast } from "../components/ui/Toast";

const STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];
const NEXT: Record<TaskStatus, TaskStatus | null> = {
  todo: "in_progress",
  in_progress: "done",
  done: null,
};

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalTask, setModalTask] = useState<Task | null | "new">(null);
  const { toast } = useToast();

  useEffect(() => { if (id) load(id); }, [id]);

  function load(projectId: string) {
    setLoading(true);
    setError(null);
    api
      .getProject(projectId)
      .then(setProject)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }

  async function handleAdvance(task: Task) {
    const next = NEXT[task.status];
    if (!next) return;
    const updated = await api.updateTask(task.id, { status: next });
    setProject((prev) => (prev ? { ...prev, tasks: prev.tasks.map((t) => (t.id === task.id ? updated : t)) } : prev));
    toast("Moved to " + next.replace("_", " "));
  }

  async function handleDelete(task: Task) {
    await api.deleteTask(task.id);
    setProject((prev) => (prev ? { ...prev, tasks: prev.tasks.filter((t) => t.id !== task.id) } : prev));
    toast("Task deleted");
  }

  async function handleSave(data: { title: string; description: string; status: TaskStatus; priority: Task["priority"]; due_date: string | null; }) {
    if (!project) return;
    if (modalTask === "new") {
      const created = await api.createTask(project.id, data);
      setProject((prev) => (prev ? { ...prev, tasks: [...prev.tasks, created] } : prev));
      toast("Task created");
    } else if (modalTask) {
      const updated = await api.updateTask(modalTask.id, data);
      setProject((prev) => (prev ? { ...prev, tasks: prev.tasks.map((t) => (t.id === modalTask.id ? updated : t)) } : prev));
      toast("Task saved");
    }
    setModalTask(null);
  }

  if (loading) {
    return (
      <div className="bg-measured min-h-screen">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col gap-8 sm:flex-row sm:gap-10">
            {STATUSES.map((s) => (
              <div key={s} className="flex-1 space-y-2.5">
                <Skeleton.Card />
                <Skeleton.Card />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-measured min-h-screen">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <ErrorState title="Couldn't load board" message={error} onRetry={() => id && load(id)} />
          <Link to="/" className="mt-4 inline-block font-mono text-[0.7rem] uppercase tracking-wide text-pine hover:underline">
            ← All projects
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-measured min-h-screen">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <p className="text-sm text-muted">Project not found.</p>
          <Link to="/" className="text-sm text-pine hover:underline">← Back to projects</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-measured min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link to="/" className="mb-6 inline-flex items-center gap-1 font-mono text-[0.7rem] uppercase tracking-wide text-muted hover:text-ink focus-ring">
          ← All projects
        </Link>
        <header className="mb-10 flex items-start justify-between border-b border-ink/80 pb-5">
          <div className="flex items-start gap-3">
            <span className="mt-2 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: project.color }} />
            <div>
              <p className="mb-1 font-mono text-[0.7rem] uppercase tracking-widest text-muted">Board</p>
              <h1 className="font-display text-3xl font-medium tracking-tight text-ink">{project.name}</h1>
              {project.description && <p className="mt-1 max-w-xl text-sm text-muted">{project.description}</p>}
            </div>
          </div>
          <button
            onClick={() => setModalTask("new")}
            className="shrink-0 rounded-sm bg-pine px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-pine-dark active:translate-y-px focus-ring"
          >
            + New task
          </button>
        </header>

        <div className="flex flex-col gap-8 sm:flex-row sm:gap-10" key={project.id}>
          {STATUSES.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={project.tasks.filter((t) => t.status === status)}
              onOpenTask={(t) => setModalTask(t)}
              onAdvanceTask={handleAdvance}
              onDeleteTask={handleDelete}
              onAddTask={() => setModalTask("new")}
            />
          ))}
        </div>

        {modalTask && (
          <TaskModal task={modalTask === "new" ? null : modalTask} onClose={() => setModalTask(null)} onSave={handleSave} />
        )}
      </div>
    </div>
  );
}
