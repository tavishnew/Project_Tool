import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { AppSidebar } from '@/components/orbit/app-sidebar';
import { Topbar } from '@/components/Topbar';
import { GridNoiseBackground } from '@/components/orbit/grid-noise-background';
import { PageTransition } from '@/components/orbit/page-transition';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useAuth } from '@/auth';
import { CommandPalette } from '@/components/orbit/command-palette';
import { useEffect } from 'react';
import { useHydrated } from '@/lib/use-hydrated';

export const Route = createFileRoute('/app/')({
  component: AppLayout,
});

function AppLayout() {
  const { user } = useAuth();
  const hydrated = useHydrated();
  const navigate = useNavigate();

  useEffect(() => {
    if (hydrated && !user) navigate({ to: "/login", replace: true });
  }, [hydrated, user, navigate]);

  if (!hydrated || !user) {
    return <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">Loading…</div>;
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
      <CommandPalette />
    </SidebarProvider>
  );
}