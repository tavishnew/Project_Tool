import { createFileRoute, Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useStore } from "@/lib/mock-store";
import { MemberStack } from "@/components/orbit/member-avatar";
import { Button } from "@/components/ui/button";
import { KanbanSquare, ListChecks, Settings as SettingsIcon, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/projects/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Project — Orbit` },
      { name: "description", content: `Project ${params.id} board in Orbit.` },
      { property: "og:title", content: "Project — Orbit" },
      { property: "og:description", content: "Project board in Orbit." },
    ],
  }),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { id } = Route.useParams();
  const project = useStore((s) => s.projects.find((p) => p.id === id));
  const members = useStore((s) => s.members.filter((m) => project?.memberIds.includes(m.id)));
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  if (!project) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/70 p-16 text-center">
        <h2 className="font-display text-xl font-semibold">Project not found</h2>
        <Button className="mt-4" onClick={() => navigate({ to: "/app/projects" })}>Back to dashboard</Button>
      </div>
    );
  }

  const tabs = [
    { to: `/app/projects/${id}`, exact: true, label: "Board", icon: KanbanSquare },
    { to: `/app/projects/${id}/list`, label: "List", icon: ListChecks },
    { to: `/app/projects/${id}/settings`, label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/app/projects"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> All projects
        </Link>
      </div>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span
            className="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm"
            style={{ backgroundColor: project.color }}
          >
            <KanbanSquare className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">{project.name}</h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <MemberStack members={members} />
        </div>
      </header>

      <nav className="flex items-center gap-1 rounded-full border border-border bg-card p-1 w-fit">
        {tabs.map((t) => {
          const active = t.exact ? pathname === t.to : pathname === t.to || pathname.startsWith(t.to + "/");
          return (
            <button
              key={t.to}
              onClick={() => navigate({ to: t.to })}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </nav>

      <Outlet />
    </div>
  );
}
