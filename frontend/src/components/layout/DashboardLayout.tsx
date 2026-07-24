import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/orbit/app-sidebar";
import { Topbar } from "@/components/orbit/Topbar";
import { GridNoiseBackground } from "@/components/orbit/grid-noise-background";
import { PageTransition } from "@/components/orbit/page-transition";
import { useAuth } from "@/auth";

export default function DashboardLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to login if not authenticated
  if (loading) {
    return <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }

  if (!user) {
    // Use replace to avoid adding login to history stack
    navigate("/login", { replace: true });
    // Return null or a fallback while redirecting
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col">
          <Topbar />
          <GridNoiseBackground className="flex-1">
            <div className="mx-auto w-full max-w-7xl p-6 md:p-8">
              <PageTransition>
                <Outlet />
              </PageTransition>
            </div>
          </GridNoiseBackground>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
