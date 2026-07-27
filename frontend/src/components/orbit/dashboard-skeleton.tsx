import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { SpotlightCard } from "@/components/orbit/spotlight-card";

interface DashboardSkeletonProps {
  showProjectGrid?: boolean;
  projectGridColSpan?: string;
}

export function DashboardSkeleton({ 
  showProjectGrid = true, 
  projectGridColSpan = "lg:col-span-2" 
}: DashboardSkeletonProps) {
  return (
    <div className="space-y-8">
      <header className="animate-pulse">
        <div className="h-4 w-1/4 bg-muted rounded mb-2" />
        <div className="h-8 w-1/2 bg-muted rounded" />
      </header>

      {/* Stats Row */}
      <section aria-label="Stats" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            className="rounded-2xl border border-border bg-card p-5 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Loading…</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary" />
            </div>
            <div className="mt-3 font-display text-3xl font-bold tracking-tight h-10 bg-muted rounded" />
          </motion.div>
        ))}
      </section>

      {showProjectGrid && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Projects / Projects Grid */}
          <section className={projectGridColSpan}>
            <div className="mb-4 flex items-center justify-between">
              <div className="h-6 w-1/4 bg-muted rounded animate-pulse" />
              <div className="h-5 w-20 bg-muted rounded animate-pulse" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="animate-pulse"
                >
                  <SpotlightCard className="h-full">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-muted" />
                          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground h-4 w-20 bg-muted rounded" />
                        </div>
                        <div className="h-6 w-3/4 bg-muted rounded mb-2" />
                        <div className="h-4 w-full bg-muted rounded" />
                        <div className="h-4 w-5/6 bg-muted rounded" />
                      </div>
                      <div className="shrink-0 h-56 w-56 bg-muted rounded flex items-center justify-center" />
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <div className="h-6 w-20 bg-muted rounded" />
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="h-4 w-24 bg-muted rounded" />
                        <span className="h-4 w-28 bg-muted rounded" />
                      </div>
                    </div>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Quick Actions area placeholder */}
          <section className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-semibold">Recent tasks</h2>
              <div className="mt-4 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-card p-3 animate-pulse">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="h-2 w-2 rounded-full flex-shrink-0 bg-muted" />
                      <div className="min-w-0">
                        <div className="h-4 w-40 bg-muted rounded" />
                        <div className="h-3 w-32 bg-muted rounded mt-1" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <div className="h-5 w-5 rounded-full bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Backlog */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold">Backlog (all projects)</h2>
                <p className="text-sm text-muted-foreground">Unstarted tasks across every project</p>
              </div>
              <div className="mt-4 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-card p-3 animate-pulse">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="h-2 w-2 rounded-full flex-shrink-0 bg-muted" />
                      <div className="min-w-0">
                        <div className="h-4 w-40 bg-muted rounded" />
                        <div className="h-3 w-32 bg-muted rounded mt-1" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <div className="h-4 w-24 bg-muted rounded" />
                      <div className="h-5 w-5 rounded-full bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-5 w-32 bg-muted rounded" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Button key={i} variant="outline" className="w-full justify-start gap-3 h-10 animate-pulse">
                    <span className="h-4 w-4 bg-muted rounded" />
                    <span className="h-4 w-1/3 bg-muted rounded" />
                  </Button>
                ))}
              </CardContent>
            </Card>
          </section>
        </div>
      )}
    </div>
  );
}
