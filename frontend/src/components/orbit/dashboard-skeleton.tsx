import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";
import { SpotlightCard } from "@/components/orbit/spotlight-card";

interface DashboardSkeletonProps {
  /** "dashboard" also renders the recent tasks / backlog / quick actions column. */
  variant?: "dashboard" | "projects";
  projectCardCount?: number;
}

function ProjectCardSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="animate-pulse"
    >
      <SpotlightCard className="h-full">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-muted" />
              <span className="h-3 w-16 rounded bg-muted" />
            </div>
            <div className="h-5 w-3/4 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
          </div>
          <div className="h-14 w-14 shrink-0 rounded-full bg-muted" />
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div className="h-6 w-20 rounded bg-muted" />
          <div className="h-4 w-24 rounded bg-muted" />
        </div>
      </SpotlightCard>
    </motion.div>
  );
}

function TaskRowSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 animate-pulse">
      <div className="flex min-w-0 items-center gap-3">
        <span className="h-2 w-2 shrink-0 rounded-full bg-muted" />
        <div className="min-w-0 space-y-1">
          <div className="h-4 w-40 rounded bg-muted" />
          <div className="h-3 w-32 rounded bg-muted" />
        </div>
      </div>
      <div className="h-5 w-5 rounded-full bg-muted" />
    </div>
  );
}

export function DashboardSkeleton({
  variant = "dashboard",
  projectCardCount = 3,
}: DashboardSkeletonProps) {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>

      <header className="animate-pulse">
        <div className="mb-2 h-4 w-40 rounded bg-muted" />
        <div className="h-8 w-72 rounded bg-muted" />
      </header>

      <section aria-label="Stats" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            className="animate-pulse rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <span className="h-4 w-20 rounded bg-muted" />
              <span className="h-8 w-8 rounded-lg bg-primary/10" />
            </div>
            <div className="mt-3 h-9 w-16 rounded bg-muted" />
          </motion.div>
        ))}
      </section>

      {variant === "projects" ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: projectCardCount }).map((_, i) => (
            <ProjectCardSkeleton key={i} index={i} />
          ))}
        </section>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div className="h-6 w-40 animate-pulse rounded bg-muted" />
              <div className="h-5 w-20 animate-pulse rounded bg-muted" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: projectCardCount }).map((_, i) => (
                <ProjectCardSkeleton key={i} index={i} />
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <div>
              <div className="h-6 w-32 animate-pulse rounded bg-muted" />
              <div className="mt-4 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <TaskRowSkeleton key={i} />
                ))}
              </div>
            </div>

            <div>
              <div className="h-6 w-48 animate-pulse rounded bg-muted" />
              <div className="mt-4 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <TaskRowSkeleton key={i} />
                ))}
              </div>
            </div>

            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-5 w-32 rounded bg-muted" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 w-full rounded-md bg-muted" />
                ))}
              </CardContent>
            </Card>
          </section>
        </div>
      )}
    </div>
  );
}
