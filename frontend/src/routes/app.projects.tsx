import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle2, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/api';
import { useQueryClient } from '@tanstack/react-query';
import { ProgressRing } from '@/components/orbit/progress-ring';
import { MemberStack } from '@/components/orbit/member-avatar';
import { SpotlightCard } from '@/components/orbit/spotlight-card';
import { NewProjectDialog } from '@/components/orbit/new-project-dialog';
import { DashboardSkeleton } from '@/components/orbit/dashboard-skeleton';
import { useProjectsOverview } from '@/hooks/use-projects-overview';
import type { Project, ProjectStatus } from '@/types';

export const Route = createFileRoute('/app/projects')({
  component: ProjectsPage,
});

type StatusFilter = 'all' | ProjectStatus;
type SortKey = 'recent' | 'name' | 'progress';

const PAGE_SIZE = 12;

function ProjectsPage() {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('recent');
  const [page, setPage] = useState(1);

  const { projects, tasks, members, stats, isLoading, error } = useProjectsOverview();

  const progressOf = (project: Project) => {
    const pTasks = tasks.filter((t) => t.project_id === project.id);
    const doneCount = pTasks.filter((t) => t.status === 'done').length;
    return { pTasks, doneCount, pct: pTasks.length ? doneCount / pTasks.length : 0 };
  };

  const visibleProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = projects.filter((project) => {
      const matchesQuery = !query || project.name.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === 'all' || (project.status ?? 'active') === statusFilter;
      return matchesQuery && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      if (sortKey === 'progress') return progressOf(b).pct - progressOf(a).pct;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [projects, tasks, search, statusFilter, sortKey]);

  const pageCount = Math.max(1, Math.ceil(visibleProjects.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paginated =
    visibleProjects.length > PAGE_SIZE
      ? visibleProjects.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
      : visibleProjects;

  if (isLoading) {
    return <DashboardSkeleton variant="projects" />;
  }

  if (error) {
    return <div className="text-center text-destructive p-6">Error loading data</div>;
  }

  const handleCreateProject = async (name: string, description: string, color?: string) => {
    try {
      await api.createProject(name, description, color);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setOpen(false);
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} in this workspace
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search projects"
              aria-label="Search projects"
              className="w-56 pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as StatusFilter);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortKey} onValueChange={(value) => setSortKey(value as SortKey)}>
            <SelectTrigger className="w-44" aria-label="Sort projects">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently created</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
            </SelectContent>
          </Select>
          <Button size="lg" className="rounded-full" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New project
          </Button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 font-display text-3xl font-bold tracking-tight">{s.value}</div>
          </motion.div>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Your projects</h2>
          <span className="text-sm text-muted-foreground">
            {visibleProjects.length} of {projects.length} shown
          </span>
        </div>
        {projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/70 p-16 text-center">
            <h3 className="font-display text-lg font-semibold">No projects yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Kick things off with your first project.</p>
            <Button className="mt-6 rounded-full" onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create project
            </Button>
          </div>
        ) : visibleProjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/70 p-16 text-center">
            <h3 className="font-display text-lg font-semibold">No matching projects</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search term or status filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginated.map((project, i) => {
              const { pTasks, doneCount, pct } = progressOf(project);
              // Filter members for this project
              const pMembers = members.filter((m) => project.member_ids?.includes(m.id)) || [];

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Link to={`/app/projects/${project.id}`} className="block">
                    <SpotlightCard className="h-full">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="mb-3 flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: project.color }} />
                            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Project
                            </span>
                          </div>
                          <h3 className="font-display text-lg font-semibold">{project.name}</h3>
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
                        </div>
                        <ProgressRing value={pct} />
                      </div>
                      <div className="mt-6 flex items-center justify-between">
                        <MemberStack members={pMembers} />
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" /> {pMembers.length}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> {doneCount}/{pTasks.length}
                          </span>
                        </div>
                      </div>
                    </SpotlightCard>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {visibleProjects.length > PAGE_SIZE && (
          <nav aria-label="Projects pagination" className="mt-6 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            >
              Next
            </Button>
          </nav>
        )}
      </section>

      <NewProjectDialog 
        open={open} 
        onOpenChange={setOpen}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}