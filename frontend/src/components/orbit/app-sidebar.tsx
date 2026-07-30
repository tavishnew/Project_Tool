import { useNavigate, useLocation } from '@tanstack/react-router';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutGrid,
  Settings,
  LogOut,
  FolderKanban,
  Users,
} from "lucide-react";
import { OrbitMark } from "./orbit-mark";
import { useAuth } from "@/auth";
import { api } from "@/api";
import type { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { SidebarFilters } from "./sidebar-filters";
import { useSidebarFilters } from "@/lib/sidebar-filters-context";
import * as React from "react";

// Extracted: workspace nav links (Projects, Members, Settings)
function WorkspaceNav({ isActive, onNavigate }: { isActive: (p: string) => boolean; onNavigate: (to: string) => void }) {
  const { user } = useAuth();
  return (
    <SidebarGroup data-testid="workspace-nav">
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton isActive={isActive("/app")} onClick={() => onNavigate("/app")}>
              <LayoutGrid />
              <span>Projects</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {user?.role === 'admin' && (
            <SidebarMenuItem>
              <SidebarMenuButton isActive={isActive("/app/members")} onClick={() => onNavigate("/app/members")}>
                <Users />
                <span>Members</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton isActive={isActive("/app/settings")} onClick={() => onNavigate("/app/settings")}>
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

// Extracted: skeleton loader for project list
function SkeletonProjectItem() {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton>
        <span className="shrink-0 h-2 w-2 rounded-full bg-muted-foreground/20" />
        <span className="animate-pulse rounded bg-muted-foreground/20 px-4 py-1 text-transparent">Loading</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

// Extracted: single project nav item
function ProjectNavItem({ project, isActive, onNavigate }: { project: Project; isActive: (p: string) => boolean; onNavigate: (to: string) => void }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive(`/app/projects/${project.id}`) || isActive(`/app/projects/${project.id}/list`)}
        onClick={() => onNavigate(`/app/projects/${project.id}`)}
      >
        <span className="shrink-0 h-2 w-2 rounded-full" style={{ backgroundColor: project.color }} />
        <span className="truncate">{project.name}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const pathname = location.pathname;
  const { filters, setFilters } = useSidebarFilters();

  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProjects = async () => {
      if (!user) {
        setProjects([]);
        setLoading(false);
        return;
      }
      try {
        const res = await api.listProjects();
        setProjects(res.projects ?? []);
      } catch (err) {
        console.error("Failed to fetch projects", err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [user]);

  const { notify } = useToast();

  const isActive = (p: string) => pathname === p || pathname.startsWith(p + "/");

  const handleLogout = async () => {
    try {
      await api.logout();
      notify("Signed out");
    } catch (err) {
      console.error("Logout failed", err);
      notify("Failed to sign out", "error");
    }
    navigate({ to: "/", replace: true });
  };

  const handleNavigate = (to: string) => {
    navigate({ to, replace: true });
  };

  return (
    <Sidebar collapsible="offcanvas" data-testid="app-sidebar">
      <SidebarHeader className="border-b border-sidebar-border">
        <button className="flex w-full items-center gap-2 px-2 py-1.5 text-left" onClick={() => handleNavigate("/app")}>
          <OrbitMark size={26} />
          <span className="font-display text-lg font-bold tracking-tight">Orbit</span>
        </button>
      </SidebarHeader>

      <SidebarContent>
        <WorkspaceNav isActive={isActive} onNavigate={handleNavigate} />

        <SidebarFilters filters={filters} onChange={setFilters} />

        <SidebarGroup data-testid="project-list">
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonProjectItem key={i} />)
              ) : (
                projects.map((p) => <ProjectNavItem key={p.id} project={p} isActive={isActive} onNavigate={handleNavigate} />)
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border" data-testid="sidebar-footer">
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}