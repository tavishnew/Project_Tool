export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectStatus = 'active' | 'completed' | 'archived';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'user' | 'admin';
  avatar_url?: string | null;
  created_at?: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  isOwner: boolean;
  role?: 'member' | 'admin';
  color?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
  task_count: number;
  done_count: number;
  member_count: number;
  is_owner?: boolean;
  members?: Member[];
  member_ids?: string[];
  color?: string;
  status?: ProjectStatus;
  can_manage_members?: boolean;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  assignee_id: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
}

export type InvitationDeliveryStatus = 'not_attempted' | 'sent' | 'failed';

export interface ProjectInvitation {
  id: string;
  email: string;
  role: 'member' | 'admin';
  status: 'pending' | 'accepted' | 'revoked';
  invited_by: string;
  expires_at: string;
  created_at: string;
  accepted_at: string | null;
  delivery_status: InvitationDeliveryStatus;
  delivery_error: string | null;
  delivery_message_id: string | null;
  delivery_attempted_at: string | null;
}

export interface ProjectInvitationCreateResult {
  invite: ProjectInvitation;
  delivery: {
    status: Exclude<InvitationDeliveryStatus, 'not_attempted'>;
    attempted_at?: string | null;
    error?: string | null;
  };
  warning?: string;
}

export interface ProjectInvitationPreview {
  projectId: string;
  projectName: string;
  email: string;
  role: 'member' | 'admin';
  expiresAt: string;
}

export interface OwnedProjectForDeletion {
  id: string;
  name: string;
  eligibleMembers: Array<{ id: string; name: string; email: string }>;
}

export interface WorkspaceInvite {
  id: string;
  token: string;
  email: string;
  created_by: string;
  created_at: string;
  expires_at: string;
  used_at: string | null;
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'In Review',
  done: 'Done',
};

export const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const PRIORITY_RANK: Record<TaskPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};
