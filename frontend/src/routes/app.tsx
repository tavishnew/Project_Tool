import { createFileRoute, Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import { AppSidebar, Topbar } from '@/components/orbit';
import { GridNoiseBackground } from '@/components/orbit/grid-noise-background';
import { PageTransition } from '@/components/orbit/page-transition';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useAuth } from '@/auth';
import { CommandPalette } from '@/components/orbit/command-palette';
import { useEffect } from 'react';
import { useHydrated } from '@/lib/use-hydrated';
import { SidebarFiltersProvider } from '@/lib/sidebar-filters-context';

export const Route = createFileRoute('/app')({
  component: AppLayout,
});

function AppLayout() {
  const { user } = useAuth();
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (hydrated && !user) navigate({ to: "/login", replace: true });
  }, [hydrated, user, navigate]);

  if (!hydrated || !user) {
    return <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">Loading—</div>;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full bg-background" data-testid="app-layout">
        <SidebarFiltersProvider>
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
        </SidebarFiltersProvider>
      </div>
      <CommandPalette />
    </SidebarProvider>
  );
}