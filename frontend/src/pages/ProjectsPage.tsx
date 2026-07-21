import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { Project } from '../types';
import { useAuth } from '../auth';
import ProgressRing from '../components/ProgressRing';
import ProjectModal from '../components/ProjectModal';
import { SkeletonCard } from '../components/Skeleton';
import { useToast } from '../components/Toast';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .listProjects()
      .then((r) => setProjects(r.projects))
      .catch((e) => notify(e.message, 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const create = async (name: string, description: string) => {
    await api.createProject(name, description);
    notify('Project created');
    setShowModal(false);
    load();
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-sub">Projects you own or collaborate on.</p>
        </div>
        {user && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="project-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <h3>No projects yet</h3>
          <p>Create your first project to start tracking tasks.</p>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((p) => {
            const pct = p.task_count ? Math.round((p.done_count / p.task_count) * 100) : 0;
            return (
              <a
                key={p.id}
                className="project-card"
                href={'/projects/' + p.id}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/projects/' + p.id);
                }}
              >
                <h3>{p.name}</h3>
                <p className="project-desc">{p.description || 'No description'}</p>
                <div className="project-meta">
                  <ProgressRing value={pct} color="var(--accent)" label={pct + '%'} />
                  <span className="project-stats">
                    {p.done_count}/{p.task_count} done &middot; {p.member_count} {p.member_count === 1 ? 'member' : 'members'}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {showModal && <ProjectModal onClose={() => setShowModal(false)} onCreate={create} />}
    </div>
  );
}
