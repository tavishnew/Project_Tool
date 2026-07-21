import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import type { Project, Task, TaskStatus } from '../types';
import Board from '../components/Board';
import TaskModal from '../components/TaskModal';
import { SkeletonTask } from '../components/Skeleton';
import { AvatarStack } from '../components/Avatar';
import { useToast } from '../components/Toast';

export default function BoardPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([api.getProject(id), api.listTasks(id)])
      .then(([p, t]) => {
        setProject(p.project);
        setTasks(t.tasks);
      })
      .catch((e) => notify(e.message, 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  const moveTask = async (taskId: string, status: TaskStatus) => {
    const current = tasks.find((t) => t.id === taskId);
    if (!current || current.status === status) return;
    const snapshot = tasks;
    setTasks((ts) => ts.map((t) => (t.id === taskId ? { ...t, status } : t)));
    try {
      await api.updateTask(taskId, { status });
    } catch (e) {
      setTasks(snapshot);
      notify(e instanceof Error ? e.message : 'Move failed', 'error');
    }
  };

  const saveTask = async (data: {
    title: string;
    description: string;
    assigneeId: string | null;
    priority: Task['priority'];
    dueDate: string | null;
    status: TaskStatus;
  }) => {
    if (editing) {
      const { task } = await api.updateTask(editing.id, data);
      setTasks((ts) => ts.map((t) => (t.id === task.id ? task : t)));
      notify('Task updated');
    } else {
      const { task } = await api.createTask(id, data);
      setTasks((ts) => [...ts, task]);
      notify('Task created');
    }
    setShowAdd(false);
    setEditing(null);
  };

  const deleteTask = async () => {
    if (!editing) return;
    await api.deleteTask(editing.id);
    setTasks((ts) => ts.filter((t) => t.id !== editing.id));
    notify('Task deleted');
    setEditing(null);
  };

  const members = project?.members ?? [];

  return (
    <div>
      <div className="board-toolbar">
        <Link to="/projects" className="btn btn-ghost">
          ← Projects
        </Link>
        <h1 className="page-title" style={{ fontSize: 22 }}>
          {project?.name ?? 'Project'}
        </h1>
        {members.length > 0 && <AvatarStack members={members} />}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="seg">
            <NavLink to={`/projects/${id}`} end className={({ isActive }) => (isActive ? 'active' : '')}>
              Board
            </NavLink>
            <NavLink to={`/projects/${id}/list`} className={({ isActive }) => (isActive ? 'active' : '')}>
              List
            </NavLink>
            <NavLink to={`/projects/${id}/settings`} className={({ isActive }) => (isActive ? 'active' : '')}>
              Settings
            </NavLink>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowAdd(true); }}>
            + Add Task
          </button>
        </div>
      </div>

      {loading ? (
        <div className="board">
          {[0, 1, 2].map((c) => (
            <div key={c} className="column">
              <div className="column-head">
                <span className="column-title">Column</span>
              </div>
              <SkeletonTask />
              <SkeletonTask />
            </div>
          ))}
        </div>
      ) : (
        <Board tasks={tasks} members={members} onDropTask={moveTask} onOpenTask={(t) => setEditing(t)} />
      )}

      {showAdd && (
        <TaskModal members={members} task={null} onClose={() => setShowAdd(false)} onSave={saveTask} />
      )}
      {editing && (
        <TaskModal
          members={members}
          task={editing}
          onClose={() => setEditing(null)}
          onSave={saveTask}
          onDelete={deleteTask}
        />
      )}
    </div>
  );
}
