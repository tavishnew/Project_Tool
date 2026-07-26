import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { KanbanSquare, ListChecks, Settings } from "lucide-react";
import { api } from "@/api";
import { MemberStack } from "@/components/orbit/member-avatar";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/app/projects/$id")({
  component: ProjectDetailLayout,
});

function ProjectDetailLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = Route.useParams();
  const [projectData, setProjectData] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProject() {
      setLoading(true);
      try {
        const data = await api.getProject(id);
        setProjectData(data.project);
      } catch {
        // Error handled by child routes
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [id]);

  // Determine active tab from current location
  const getActiveTab = () => {
    if (location.pathname.endsWith("/list")) return "list";
    if (location.pathname.endsWith("/settings")) return "settings";
    return "board";
  };

  const handleTabChange = (value: string) => {
    switch (value) {
      case "list":
        navigate({ to: "/app/projects/$id/list", params: { id }, replace: true });
        break;
      case "settings":
        navigate({ to: "/app/projects/$id/settings", params: { id }, replace: true });
        break;
      default:
        navigate({ to: "/app/projects/$id/", params: { id }, replace: true });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        Loading project…
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-destructive">
        Failed to load project
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/app/projects" className="text-muted-foreground hover:text-foreground">
          All projects
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="font-semibold">{projectData.name}</span>
      </div>

      {/* Project Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div
            className="shrink-0 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: projectData.color }}
          >
            <KanbanSquare className="h-8 w-8 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-bold tracking-tight truncate">
              {projectData.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              {projectData.description || "No description provided."}
            </p>
          </div>
        </div>
        <MemberStack members={projectData.members || []} max={4} size={32} />
      </div>

      {/* Tab Navigation - Segmented Control */}
      <Tabs value={getActiveTab()} onValueChange={handleTabChange} className="w-full">
        <TabsList className="rounded-full bg-muted p-1" aria-label="Project views">
          <TabsTrigger value="board" className="rounded-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
            <div className="flex items-center gap-2">
              <KanbanSquare className="h-4 w-4" />
              Board
            </div>
          </TabsTrigger>
          <TabsTrigger value="list" className="rounded-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
            <div className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              List
            </div>
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </div>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Outlet renders the active child route (board, list, or settings) */}
      <Outlet />
    </div>
  );
}