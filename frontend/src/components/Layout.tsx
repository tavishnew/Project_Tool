import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth";
import { api } from "@/api";
import { useToast } from "@/components/Toast";
import { LayoutGrid, KanbanSquare, Settings, Users, Sparkles, LogOut, FolderKanban, ChevronLeft, Plus } from "lucide-react";
import { OrbitMark } from "@/components/orbit/OrbitMark";
import { PageTransition } from "@/components/orbit/PageTransition";
import { useState } from "react";

export default function Layout() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const { notify } = useToast();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logout = async () => {
    await api.logout().catch(() => {});
    await refresh();
    notify("Signed out");
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-sidebar-border bg-sidebar flex flex-col transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-4 border-b border-sidebar-border">
          <Link to="/projects" className="flex items-center gap-2 px-2 py-1.5">
            <OrbitMark size={26} />
            <span className="font-display text-lg font-bold tracking-tight">Orbit</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
          <div>
            <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Workspace</p>
            <nav className="space-y-1">
              <Link to="/projects" className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive("/projects") ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
                <LayoutGrid className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link to="/members" className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive("/members") ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
                <Users className="h-4 w-4" />
                <span>Members</span>
              </Link>
            </nav>
          </div>

          <div>
            <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Projects</p>
            <nav className="space-y-1">
              {/* Projects would be listed here */}
              <Link to="/projects/new" className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`}>
                <Plus className="h-4 w-4" />
                <span>New project</span>
              </Link>
            </nav>
          </div>

          <div>
            <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Discover</p>
            <nav className="space-y-1">
              <button className={`flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`}>
                <Sparkles className="h-4 w-4" />
                <span>What&apos;s new</span>
              </button>
              <button className={`flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`}>
                <FolderKanban className="h-4 w-4" />
                <span>Templates</span>
              </button>
              <button className={`flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`}>
                <KanbanSquare className="h-4 w-4" />
                <span>Roadmap</span>
              </button>
              <button className={`flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`}>
                <Settings className="h-4 w-4" />
                <span>Preferences</span>
              </button>
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/70 bg-background/80 px-4 backdrop-blur-md">
          <button
            className="lg:hidden p-2 rounded-md hover:bg-accent"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="relative ml-2 hidden max-w-md flex-1 md:block">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              placeholder="Search projects, tasks, members..."
              className="input h-9 rounded-full border-border bg-secondary/60 pl-9 w-full"
            />
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button className="btn btn-ghost btn-icon rounded-full">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </button>
            <div className="relative">
              <button
                className="btn btn-ghost btn-icon rounded-full h-9 w-9"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {user?.name?.[0]?.toUpperCase() ?? "U"}
                </div>
              </button>
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md border border-border bg-background p-1 shadow-lg z-50">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <hr className="border-border my-1" />
                <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent">
                  Profile
                </button>
                <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent">
                  Preferences
                </button>
                <hr className="border-border my-1" />
                <button onClick={logout} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="grid-noise-bg flex-1">
          <div className="noise-overlay" aria-hidden="true" />
          <div className="relative">
            <div className="mx-auto w-full max-w-7xl p-6 md:p-8 scrollbar-hide">
              <PageTransition>
                <Outlet />
              </PageTransition>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
