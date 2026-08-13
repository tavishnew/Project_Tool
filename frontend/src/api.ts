const BASE = '/api';

type ApiError = Error & {
  status?: number;
  retryAfter?: number;
  attemptCount?: number;
  attemptsRemaining?: number;
  recoveryAvailable?: boolean;
};

async function req<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(BASE + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(body.error || `Request failed (${res.status})`) as ApiError;
    error.status = res.status;
    error.attemptCount = Number.isFinite(Number(body.attemptCount)) ? Number(body.attemptCount) : undefined;
    error.attemptsRemaining = Number.isFinite(Number(body.attemptsRemaining)) ? Number(body.attemptsRemaining) : undefined;
    error.recoveryAvailable = body.recoveryAvailable === true;
    const retryAfter = Number(res.headers.get('retry-after'));
    if (Number.isFinite(retryAfter) && retryAfter > 0) error.retryAfter = retryAfter;
    throw error;
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

  // Direct in-page password update after the recovery threshold.
  requestPasswordUpdateCode: (email: string) =>
    req<{ success: boolean; message: string }>('/auth/password-update-code', json({ email })),
  completePasswordUpdate: (email: string, code: string, password: string, passwordConfirmation: string) =>
    req<{ success: boolean; message: string }>('/auth/password-update', json({ email, code, password, passwordConfirmation })),

  // Legacy password-reset support for previously issued reset links.
  forgotPassword: (email: string) =>
    req('/auth/forgot-password', json({ email })),
  resetPassword: (token: string, password: string) =>
    req<{ success: boolean; message: string }>(`/auth/reset-password/${encodeURIComponent(token)}`, json({ password })),
  validateResetToken: (token: string) =>
    req<{ valid: boolean; email?: string; error?: string }>(`/auth/reset-password/${token}`, { method: 'GET' }),

  listProjects: () => req<{ projects: import('./types').Project[] }>('/projects'),
  getProject: (id: string) => req<{ project: import('./types').Project }>(`/projects/${id}`),
  createProject: (name: string, description: string, color?: string) =>
    req('/projects', json({ name, description, color })),
  updateProject: (id: string, data: { name?: string; description?: string; color?: string; status?: import('./types').ProjectStatus }) =>
    req(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProject: (id: string) => req(`/projects/${id}`, { method: 'DELETE' }),

  // Workspace members (existing - immediate add)
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

  // Project invitations
  createInvite: (id: string, email: string, role: 'member' | 'admin' = 'member') =>
    req<import('./types').ProjectInvitationCreateResult>(`/projects/${id}/invites`, json({ email, role })),
  listInvites: (id: string) =>
    req<{ invites: import('./types').ProjectInvitation[] }>(`/projects/${id}/invites`),
  revokeInvite: (id: string, inviteId: string) =>
    req(`/projects/${id}/invites/${inviteId}`, { method: 'DELETE' }),
  getProjectInvitation: (token: string) =>
    req<{ invitation: import('./types').ProjectInvitationPreview }>(`/invitations/${token}`),
  acceptProjectInvitation: (token: string) =>
    req<{ ok: boolean; projectId: string; role: 'member' | 'admin' }>(`/invitations/${token}/accept`, { method: 'POST' }),

  // Workspace Invites (email-based invite flow)
  createWorkspaceInvite: (email: string) =>
    req<{ invite: import('./types').WorkspaceInvite }>('/workspace/invites', json({ email })),
  listWorkspaceInvites: () =>
    req<{ invites: import('./types').WorkspaceInvite[] }>('/workspace/invites'),
  cancelWorkspaceInvite: (inviteId: string) =>
    req(`/workspace/invites/${inviteId}`, { method: 'DELETE' }),
  acceptWorkspaceInvite: (token: string, name: string, password: string) =>
    req<{ ok: boolean; email: string }>(`/workspace/invites/${encodeURIComponent(token)}/accept`, json({ name, password })),

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


  // Account management
  updateProfile: (data: { name?: string; avatar_url?: string | null; email?: string; currentPassword?: string }) =>
    req<{ user: import('./types').User }>('/auth/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  changePassword: (currentPassword: string, newPassword: string) =>
    req<{ ok: boolean; message: string }>('/auth/change-password', json({ currentPassword, newPassword })),
  getAccountDeletionOptions: () =>
    req<{ ownedProjects: import('./types').OwnedProjectForDeletion[] }>('/auth/account-deletion-options'),
  deleteAccount: (currentPassword: string, transfers: Array<{ projectId: string; newOwnerId: string }>) =>
    req<{ ok: boolean }>('/auth/account', { method: 'DELETE', body: JSON.stringify({ currentPassword, transfers }) }),
};
