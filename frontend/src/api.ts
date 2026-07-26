const BASE = '/api';

async function req<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(BASE + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  if (res.status === 204) return null as T;
  return res.json();
}

const json = (body: unknown) => ({ method: 'POST', body: JSON.stringify(body) });

export const api = {
  me: () => req<{ user: import('./types').User }>('/auth/me'),
  login: (email: string, password: string) =>
    req('/auth/login', json({ email, password })),
  register: (name: string, email: string, password: string, role?: 'user' | 'admin') =>
    req('/auth/register', json({ name, email, password, role })),
  logout: () => req('/auth/logout', { method: 'POST' }),

  // Password reset
  forgotPassword: (email: string) =>
    req('/auth/forgot-password', json({ email })),
  resetPassword: (token: string, password: string) =>
    req('/auth/reset-password', json({ token, password })),

  listProjects: () => req<{ projects: import('./types').Project[] }>('/projects'),
  getProject: (id: string) => req<{ project: import('./types').Project }>(`/projects/${id}`),
  createProject: (name: string, description: string, color?: string) =>
    req('/projects', json({ name, description, color })),
  updateProject: (id: string, data: { name?: string; description?: string; color?: string; status?: import('./types').ProjectStatus }) =>
    req(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProject: (id: string) => req(`/projects/${id}`, { method: 'DELETE' }),

  // Workspace members (assuming these endpoints exist on the backend)
  listMembers: () => req<{ members: import('./types').Member[] }>('/members'),
  addMember: (email: string) => req<{ member: import('./types').Member }>('/members', json({ email })),
  removeMember: (userId: string) => req(`/members/${userId}`, { method: 'DELETE' }),

  // Project members
  addProjectMember: (projectId: string, email: string) =>
    req(`/projects/${projectId}/members`, json({ email })),
  removeProjectMember: (projectId: string, userId: string) =>
    req(`/projects/${projectId}/members/${userId}`, { method: 'DELETE' }),
  listProjectMembers: (projectId: string) =>
    req<{ members: import('./types').Member[] }>(`/projects/${projectId}/members`),

  // Invites (admin + owner)
  createInvite: (id: string, email?: string) =>
    req<{ invite: import('./types').Invite }>(`/projects/${id}/invites`, json({ email })),
  listInvites: (id: string) =>
    req<{ invites: import('./types').Invite[] }>(`/projects/${id}/invites`),
  revokeInvite: (id: string, inviteId: string) =>
    req(`/projects/${id}/invites/${inviteId}`, { method: 'DELETE' }),
  acceptInvite: (token: string) =>
    req<{ ok: boolean; projectId: string }>(`/projects/invites/${token}/accept`, { method: 'POST' }),

  listTasks: (id: string, params?: { status?: string; assignee?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.assignee) q.set('assignee', params.assignee);
    const s = q.toString();
    return req<{ tasks: import('./types').Task[] }>(
      `/projects/${id}/tasks${s ? `?${s}` : ''}`
    );
  },
  createTask: (id: string, data: Record<string, unknown>) =>
    req(`/projects/${id}/tasks`, json(data)),
  updateTask: (id: string, data: Record<string, unknown>) =>
    req(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (id: string) => req(`/tasks/${id}`, { method: 'DELETE' }),

  // New: get all users (for workspace members)
  getUsers: () => req<{ users: import('./types').User[] }>('/users'),
};
