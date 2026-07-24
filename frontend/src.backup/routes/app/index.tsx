import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { AppSidebar } from '@/components/orbit/app-sidebar';
import { Topbar } from '@/components/Topbar';
import { GridNoiseBackground } from '@/components/orbit/grid-noise-background';
import { PageTransition } from '@/components/orbit/page-transition';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useAuth } from '@/auth';

export const Route = createFileRoute('/app/')({
  component: AppLayout,
});

function AppLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  if (!user) {
    navigate('/login', { replace: true });
    // Return null to prevent rendering while redirecting
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