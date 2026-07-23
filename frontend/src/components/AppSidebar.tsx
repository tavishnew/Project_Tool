import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  KanbanSquare,
  Settings,
  Users,
  Sparkles,
  LogOut,
  FolderKanban,
} from "lucide-react";
import { OrbitMark } from "@/components/orbit/OrbitMark";
import { useAuth } from "@/auth";
import { useToast } from "@/components/Toast";
import { useStore } from "@/lib/mock-store";

export function AppSidebar() {
  const { user, refresh } = useAuth();
  const { notify } = useToast();
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  const store = useStore();
  const projects = store.projects;

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" }).catch(() => {});
    await refresh();
    notify("Signed out");
    navigate("/");
  };

  const isActive = (p: string) => pathname === p || pathname.startsWith(p + "/");

  return (
    <aside className="hidden lg:block w-64 border-r border-sidebar-border bg-sidebar flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b border-sidebar-border">
          <Link to="/projects" className="flex items-center gap-2 px-2 py-1.5">
            <OrbitMark size={26} />
            <span className="font-display text-lg font-bold tracking-tight">Orbit</span>
          </Link>
        </div>

        <div className="p-4 space-y-6">
          <div>
            <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Workspace
            </p>
            <nav className="space-y-1">
              <Link
                to="/projects"
                className={`
                  flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full justify-start
                  ${isActive("/projects")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}
                `}
              >
                <LayoutGrid className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/members"
                className={`
                  flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full justify-start
                  ${isActive("/members")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}
                `}
              >
                <Users className="h-4 w-4" />
                <span>Members</span>
              </Link>
            </nav>
          </div>

          <div>
            <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Projects
            </p>
            <nav className="space-y-1">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className={`
                    flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full justify-start
                    ${isActive(`/projects/${p.id}`)
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}
                  `}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="truncate">{p.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Discover
            </p>
            <nav className="space-y-1">
              <button
                className={`
                  flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors text-sidebar-foreground
                  hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                `}
              >
                <Sparkles className="h-4 w-4" />
                <span>What's new</span>
              </button>
              <button
                className={`
                  flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors text-sidebar-foreground
                  hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                `}
              >
                <FolderKanban className="h-4 w-4" />
                <span>Templates</span>
              </button>
              <button
                className={`
                  flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors text-sidebar-foreground
                  hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                `}
              >
                <KanbanSquare className="h-4 w-4" />
                <span>Roadmap</span>
              </button>
              <button
                className={`
                  flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors text-sidebar-foreground
                  hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                `}
              >
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
      </div>
    </aside>
  );
}