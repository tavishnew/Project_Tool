import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/api";
import type { Project, Task, Member } from "@/types";
import { Plus, FolderKanban, CheckCircle2, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/auth";
import { useToast } from "@/components/Toast";
import { ProgressRing } from "@/components/orbit/ProgressRing";
import { MemberStack, type Member as OrbitMember } from "@/components/orbit/MemberAvatar";
import { SpotlightCard } from "@/components/orbit/SpotlightCard";
import NewProjectDialog from "@/components/NewProjectDialog";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notify } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  // task lists keyed by projectId
  const [tasksMap, setTasksMap] = useState<Record<string, Task[]>>({});
  // all members deduplicated by id
  const [membersMap, setMembersMap] = useState<Record<string, Member>>({});
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const projectsRes = await api.projects.listProjects();
      const projectList = projectsRes.projects ?? [];

      // For each project, fetch its details (with members) and its tasks
      const promises = projectList.map(async (proj) => {
        try {
          const [projRes, tasksRes] = await Promise.all([
            api.getProject(proj.id),
            api.listTasks(proj.id),
          ]);
          const detailed = projRes.project ?? proj;
          const tasks = tasksRes.tasks ?? [];
          return { project: detailed, tasks };
        } catch (err) {
          console.warn(`Failed to load project ${proj.id}`, err);
          return { project: proj, tasks: [] };
        }
      });

      const results = await Promise.allSettled(promises);

      const newProjects: Project[] = [];
      const newTasksMap: Record<string, Task[]> = {};
      const newMembersMap: Record<string, Member> = {};

      for (const result of results) {
        if (result.status === "fulfilled") {
          const { project, tasks } = result.value;
          newProjects.push(project);
          if (tasks.length > 0) newTasksMap[project.id] = tasks;
          for (const m of project.members ?? []) {
            if (m.id && !(m.id in newMembersMap)) {
              newMembersMap[m.id] = m;
            }
          }
        }
      }

      setProjects(newProjects);
      setTasksMap(newTasksMap);
      setMembersMap(newMembersMap);
    } catch (err) {
      console.error("Failed to load projects data", err);
      setProjects([]);
      setTasksMap({});
      setMembersMap({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refetch = useCallback(() => {
    loadData();
  }, [loadData]);

  const getTasksForProject = (pid: string): Task[] => {
    return tasksMap[pid] ?? [];
  };

  const allMembers = Object.values(membersMap);

  // stats
  const totalProjects = projects.length;
  let open = 0, inProg = 0, done = 0;
  projects.forEach((p) => {
    const ts = getTasksForProject(p.id);
    ts.forEach((t) => {
      if (t.status === "done") done++;
      else if (t.status === "in_progress") inProg++;
      else open++;
    });
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Good to see you, {user?.name?.split(" ")[0] ?? "friend"}.
          </h1>
        </div>
        <Button size="lg" className="rounded-full" onClick={() => setNewProjectOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New project
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 animate-fade-in-up" style={{ animationDelay: "0" }}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Projects</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><FolderKanban className="h-4 w-4" /></span>
          </div>
          <div className="mt-3 font-display text-3xl font-bold tracking-tight">{totalProjects}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 animate-fade-in-up" style={{ animationDelay: "40" }}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Open tasks</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Clock className="h-4 w-4" /></span>
          </div>
          <div className="mt-3 font-display text-3xl font-bold tracking-tight">{open}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 animate-fade-in-up" style={{ animationDelay: "80" }}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">In progress</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><FolderKanban className="h-4 w-4" /></span>
          </div>
          <div className="mt-3 font-display text-3xl font-bold tracking-tight">{inProg}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 animate-fade-in-up" style={{ animationDelay: "120" }}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Completed</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><CheckCircle2 className="h-4 w-4" /></span>
          </div>
          <div className="mt-3 font-display text-3xl font-bold tracking-tight">{done}</div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Your projects</h2>
          <span className="text-sm text-muted-foreground">{totalProjects} total</span>
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
            {projects.map((p, idx) => {
              const ts = getTasksForProject(p.id);
              const doneCount = ts.filter((t) => t.status === "done").length;
              const pct = ts.length ? doneCount / ts.length : 0;
              const memberIds = p.memberIds ?? [];
              const pMembers = memberIds.map((id) => membersMap[id]).filter(Boolean);
              return (
                <Link key={p.id} to={`/projects/${p.id}`} className="block animate-fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
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
                      <MemberStack members={pMembers as OrbitMember[]} />
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {pMembers.length}</span>
                        <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> {doneCount}/{ts.length}</span>
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
            await refetch();
            notify("Project created");
            navigate(`/projects/${project.id}`);
          }}
        />
      )}
    </div>
  );
}
