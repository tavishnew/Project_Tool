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
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutGrid,
  Settings,
  LogOut,
  Users,
} from "lucide-react";
import { OrbitMark } from "./orbit-mark";
import { useAuth } from "@/auth";
import { api } from "@/api";
import type { Project } from "@/types";
import { useToast } from "@/components/ui/toast";
import { SidebarFilters } from "./sidebar-filters";
import { useSidebarFilters } from "@/lib/sidebar-filters-context";
import * as React from "react";

function WorkspaceNav({ isActive, onNavigate }: { isActive: (p: string) => boolean; onNavigate: (to: string) => void }) {
  const { user } = useAuth();
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:px-1.5">
          <SidebarGroupLabel className="ledger-caption px-2 text-muted-foreground">Workspace</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-1.5">
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Projects" isActive={isActive("/app")} onClick={() => onNavigate("/app")} className="group-data-[collapsible=icon]:mx-auto">
              <LayoutGrid />
              <span>Projects</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {user?.role === 'admin' && (
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Members" isActive={isActive("/app/members")} onClick={() => onNavigate("/app/members")} className="group-data-[collapsible=icon]:mx-auto">
                <Users />
                <span>Members</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings" isActive={isActive("/app/settings")} onClick={() => onNavigate("/app/settings")} className="group-data-[collapsible=icon]:mx-auto">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function SkeletonProjectItem() {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton aria-label="Loading project" className="group-data-[collapsible=icon]:mx-auto">
        <span className="h-5 w-5 shrink-0 animate-pulse rounded-md bg-muted-foreground/20" />
        <span className="animate-pulse rounded bg-muted-foreground/20 px-4 py-1 text-transparent">Loading</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function ProjectNavItem({ project, isActive, onNavigate }: { project: Project; isActive: (p: string) => boolean; onNavigate: (to: string) => void }) {
  const initial = project.name.trim().charAt(0).toUpperCase() || "P";
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={project.name}
        isActive={isActive(`/app/projects/${project.id}`) || isActive(`/app/projects/${project.id}/list`)}
        onClick={() => onNavigate(`/app/projects/${project.id}`)}
        className="group-data-[collapsible=icon]:mx-auto"
      >
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold leading-none text-white shadow-sm"
          style={{ backgroundColor: project.color || "#A0522D" }}
          aria-hidden="true"
        >
          {initial}
        </span>
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
  const { setOpenMobile } = useSidebar();

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
  const isActive = (p: string) => {
    if (p === "/app") return pathname === "/app" || pathname === "/app/";
    return pathname === p || pathname.startsWith(p + "/");
  };

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
    setOpenMobile(false);
    navigate({ to, replace: true });
  };

  return (
    <Sidebar collapsible="offcanvas" data-testid="app-sidebar" className="border-sidebar-border bg-sidebar shadow-[4px_0_0_hsl(var(--foreground)/0.06)] group-data-[collapsible=icon]:border-r">
      <SidebarHeader className="border-b border-sidebar-border px-2.5 py-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-1.5">
        <button
          className="flex w-full items-center gap-2 border border-transparent px-1.5 py-1.5 text-left transition-colors hover:border-sidebar-border hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
          onClick={() => handleNavigate("/app")}
          title="Orbit home"
          aria-label="Orbit home"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><OrbitMark size={21} /></span>
          <span className="font-display text-lg font-semibold tracking-tight group-data-[collapsible=icon]:hidden">Orbit</span>
        </button>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <WorkspaceNav isActive={isActive} onNavigate={handleNavigate} />

        <div className="group-data-[collapsible=icon]:hidden">
          <SidebarFilters filters={filters} onChange={setFilters} />
        </div>

        <SidebarGroup data-testid="project-list" className="group-data-[collapsible=icon]:px-1.5">
          <SidebarGroupLabel className="ledger-caption px-2 text-muted-foreground">Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-1.5">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonProjectItem key={i} />)
              ) : projects.length ? (
                projects.map((p) => <ProjectNavItem key={p.id} project={p} isActive={isActive} onNavigate={handleNavigate} />)
              ) : (
                <p className="px-2 py-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">No projects yet</p>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-2.5 py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Sign out" onClick={handleLogout} className="text-destructive hover:text-destructive">
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
