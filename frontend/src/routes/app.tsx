import { createFileRoute, Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import { AppSidebar, Topbar } from '@/components/orbit';
import { GridNoiseBackground } from '@/components/orbit/grid-noise-background';
import { PageTransition } from '@/components/orbit/page-transition';
import { SidebarProvider, SidebarInset, useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/auth';
import { CommandPalette } from '@/components/orbit/command-palette';
import { useEffect } from 'react';
import { useHydrated } from '@/lib/use-hydrated';
import { SidebarFiltersProvider } from '@/lib/sidebar-filters-context';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/app')({
  component: AppLayout,
});

function AppLayout() {
  return (
    <SidebarProvider>
      <AppShell />
    </SidebarProvider>
  );
}

function AppShell() {
  const { user } = useAuth();
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const location = useLocation();
  const { state: sidebarState } = useSidebar();
  const navigationVisible = sidebarState === 'expanded';

  useEffect(() => {
    if (hydrated && !user) navigate({ to: "/login", replace: true });
  }, [hydrated, user, navigate]);

  if (!hydrated || !user) {
    return <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">Loading—</div>;
  }

  return (
    <div className="flex min-h-svh w-full bg-background" data-testid="app-layout" data-navigation={navigationVisible ? 'visible' : 'hidden'}>
      <SidebarFiltersProvider>
        <AppSidebar />
        <SidebarInset
          className={cn(
            "flex min-w-0 flex-col bg-background transition-[width] duration-300 ease-in-out md:!flex-none",
            navigationVisible ? "md:!w-[calc(100%-var(--sidebar-width))]" : "md:!w-full",
          )}
        >
          <Topbar />
          <GridNoiseBackground className="flex-1">
            <div
              className={cn(
                "mx-auto w-full transition-[max-width,padding] duration-300 ease-in-out",
                navigationVisible
                  ? "max-w-[1500px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8"
                  : "max-w-[1720px] px-5 py-5 sm:px-8 sm:py-6 lg:px-10 lg:py-8",
              )}
            >
              <PageTransition>
                <Outlet />
              </PageTransition>
            </div>
          </GridNoiseBackground>
        </SidebarInset>
      </SidebarFiltersProvider>
      <CommandPalette />
    </div>
  );
}
