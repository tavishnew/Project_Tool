import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import { api } from '../api';
import type { Member, Project, Task } from '../types';
import { PRIORITY_RANK, PRIORITY_LABELS, STATUS_LABELS, STATUS_ORDER } from '../types';
import { STATUS_COLOR, isOverdue, formatDue } from '../status';
import { PriorityBadge } from '../components/Badges';
import TaskModal from '../components/TaskModal';
import { useToast } from '../components/Toast';

type SortKey = 'title' | 'assignee' | 'due' | 'priority' | 'status';
type Dir = 'asc' | 'desc';

export default function ListPage() {
  const { id = '' } = useParams();
  const { notify } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('due');
  const [dir, setDir] = useState<Dir>('asc');
  const [editing, setEditing] = useState<Task | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([api.getProject(id), api.listTasks(id)])
      .then(([p, t]) => {
        setProject(p.project);
        setMembers(p.project.members ?? []);
        setTasks(t.tasks);
      })
      .catch((e) => notify(e.message, 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  const memberOf = (mid: string | null) => members.find((m) => m.id === mid);

  const sorted = useMemo(() => {
    const arr = [...tasks];
    const cmp = (a: Task, b: Task): number => {
      switch (sortKey) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'assignee':
          return (memberOf(a.assignee_id)?.name ?? '~').localeCompare(memberOf(b.assignee_id)?.name ?? '~');
        case 'due': {
          const av = a.due_date ? new Date(a.due_date).getTime() : Infinity;
          const bv = b.due_date ? new Date(b.due_date).getTime() : Infinity;
          return av - bv;
        }
        case 'priority':
          return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
        case 'status':
          return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
      }
    };
    arr.sort(cmp);
    if (dir === 'desc') arr.reverse();
    return arr;
  }, [tasks, sortKey, dir, members]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setDir('asc');
    }
  };

  const arrow = (key: SortKey) => (key === sortKey ? <span className="arrow">{dir === 'asc' ? '↑' : '↓'}</span> : null);

  const saveTask = async (data: {
    title: string; description: string; assigneeId: string | null;
    priority: Task['priority']; dueDate: string | null; status: Task['status'];
  }) => {
    if (!editing) return;
    const { task } = await api.updateTask(editing.id, data);
    setTasks((ts) => ts.map((t) => (t.id === task.id ? task : t)));
    notify('Task updated');
    setEditing(null);
  };
  const deleteTask = async () => {
    if (!editing) return;
    await api.deleteTask(editing.id);
    setTasks((ts) => ts.filter((t) => t.id !== editing.id));
    notify('Task deleted');
    setEditing(null);
  };

  return (
    <div>
      <div className="board-toolbar">
        <Link to="/projects" className="btn btn-ghost">← Projects</Link>
        <h1 className="page-title" style={{ fontSize: 22 }}>{project?.name ?? 'Project'}</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <div className="seg">
            <NavLink to={`/projects/${id}`} end className={({ isActive }) => (isActive ? 'active' : '')}>Board</NavLink>
            <NavLink to={`/projects/${id}/list`} className={({ isActive }) => (isActive ? 'active' : '')}>List</NavLink>
            <NavLink to={`/projects/${id}/settings`} className={({ isActive }) => (isActive ? 'active' : '')}>Settings</NavLink>
          </div>
          <Link to={`/projects/${id}`} className="btn btn-primary">+ Add Task</Link>
        </div>
      </div>

      {loading ? (
        <div className="page-loading">Loading tasks…</div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <h3>No tasks yet</h3>
          <p>Switch to the Board tab to add your first task.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="task-table">
            <thead>
              <tr>
                <th onClick={() => toggleSort('title')}>Task {arrow('title')}</th>
                <th onClick={() => toggleSort('assignee')}>Assignee {arrow('assignee')}</th>
                <th onClick={() => toggleSort('due')}>Due {arrow('due')}</th>
                <th onClick={() => toggleSort('priority')}>Priority {arrow('priority')}</th>
                <th onClick={() => toggleSort('status')}>Status {arrow('status')}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((t) => {
                const overdue = isOverdue(t.due_date, t.status);
                const assignee = memberOf(t.assignee_id);
                return (
                  <tr key={t.id} className="row-link" onClick={() => setEditing(t)}>
                    <td style={{ fontWeight: 600 }}>{t.title}</td>
                    <td>{assignee ? assignee.name : <span style={{ color: 'var(--muted)' }}>Unassigned</span>}</td>
                    <td>
                      <span style={overdue ? { color: 'var(--overdue)', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 } : { fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>
                        {formatDue(t.due_date) ?? '—'}
                      </span>
                      {overdue && <span className="badge badge-overdue" style={{ marginLeft: 6 }}>Overdue</span>}
                    </td>
                    <td><PriorityBadge priority={t.priority} /></td>
                    <td>
                      <span className="status-pill" style={{ ['--col' as string]: STATUS_COLOR[t.status] }}>
                        <span className="status-dot filled" style={{ width: 10, height: 10 }} />
                        {STATUS_LABELS[t.status]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <TaskModal members={members} task={editing} onClose={() => setEditing(null)} onSave={saveTask} onDelete={deleteTask} />
      )}
    </div>
  );
}
