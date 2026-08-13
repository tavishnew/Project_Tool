import crypto from 'node:crypto';
import express from 'express';
import { requireAuth, requireProjectAdmin, requireProjectMember, requireProjectOwner } from '../auth.js';
import { db } from '../db.js';
import { sendProjectInvite } from '../lib/email.js';
import { serializeTask } from './tasks.js';
import { logProjectActivity } from '../lib/audit.js';

const router = express.Router();
router.use(requireAuth);

const INVITATION_ROLES = new Set(['member', 'admin']);

function publicAppUrl() {
  const configuredUrl = process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
  return configuredUrl.split(',')[0].trim().replace(/\/+$/, '');
}

router.param('id', (req, res, next, id) => {
  if (!/^\d+$/.test(id)) return res.status(400).json({ error: 'Invalid project ID' });
  next();
});

router.param('userId', (req, res, next, userId) => {
  if (!/^\d+$/.test(userId)) return res.status(400).json({ error: 'Invalid user ID' });
  next();
});

router.param('inviteId', (req, res, next, inviteId) => {
  if (!/^\d+$/.test(inviteId)) return res.status(400).json({ error: 'Invalid invite ID' });
  next();
});

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function serializeProject(row) {
  return {
    id: String(row.id),
    name: row.name,
    description: row.description,
    owner_id: String(row.owner_id),
    created_at: row.created_at,
    task_count: Number(row.task_count || 0),
    done_count: Number(row.done_count || 0),
    member_count: Number(row.member_count || 0),
    color: row.color || '#ff5a4e',
    status: row.status || 'active',
  };
}

function taskAggregates() {
  return `(SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) AS task_count,
          (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'done') AS done_count,
          (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id) AS member_count`;
}

function serializeInvitation(row) {
  return {
    id: String(row.id),
    email: row.email,
    role: row.role,
    status: row.status,
    invited_by: String(row.invited_by),
    expires_at: row.expires_at,
    created_at: row.created_at,
    accepted_at: row.accepted_at,
    delivery_status: row.delivery_status || 'not_attempted',
    delivery_error: row.delivery_error || null,
    delivery_message_id: row.delivery_message_id || null,
    delivery_attempted_at: row.delivery_attempted_at || null,
  };
}

// GET /api/projects — projects the user owns or belongs to.
router.get('/', async (req, res) => {
  const { rows } = await db.query(
    `SELECT p.id, p.name, p.description, p.owner_id, p.color, p.status, p.created_at, ${taskAggregates()}
     FROM projects p
     JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $1
     ORDER BY p.created_at DESC`,
    [req.user.id]
  );
  const projectIds = rows.map((row) => row.id);
  const memberIdsMap = {};
  if (projectIds.length) {
    const { rows: memberRows } = await db.query(
      'SELECT project_id, user_id FROM project_members WHERE project_id = ANY($1)',
      [projectIds]
    );
    for (const member of memberRows) {
      if (!memberIdsMap[member.project_id]) memberIdsMap[member.project_id] = [];
      memberIdsMap[member.project_id].push(String(member.user_id));
    }
  }
  res.json({
    projects: rows.map((row) => ({ ...serializeProject(row), member_ids: memberIdsMap[row.id] || [] })),
  });
});

// POST /api/projects — the creator is the owner and an admin member.
router.post('/', async (req, res) => {
  const { name, description, color } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required' });

  const { rows } = await db.query(
    `INSERT INTO projects (name, description, owner_id, color)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, description, owner_id, color, status, created_at`,
    [name, description || '', req.user.id, color || '#ff5a4e']
  );
  const project = rows[0];
  await db.query(
    'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
    [project.id, req.user.id, 'admin']
  );
  await logProjectActivity({
    projectId: project.id,
    actorId: req.user.id,
    action: 'project.created',
    entityType: 'project',
    entityId: project.id,
    metadata: { name: project.name },
  });
  res.status(201).json({
    project: serializeProject({ ...project, task_count: 0, done_count: 0, member_count: 1 }),
  });
});

// GET /api/projects/:id — project detail and project-scoped members.
router.get('/:id', requireProjectMember, async (req, res) => {
  const { rows } = await db.query(
    `SELECT p.id, p.name, p.description, p.owner_id, p.color, p.status, p.created_at, ${taskAggregates()}
     FROM projects p WHERE p.id = $1`,
    [req.params.id]
  );
  const project = rows[0];
  const { rows: memberRows } = await db.query(
    `SELECT u.id, u.name, u.email, u.avatar_url AS "avatarUrl", pm.role
     FROM project_members pm
     JOIN users u ON u.id = pm.user_id
     WHERE pm.project_id = $1
     ORDER BY u.name`,
    [req.params.id]
  );
  const members = memberRows.map((member) => ({
    ...member,
    id: String(member.id),
    isOwner: Number(project.owner_id) === Number(member.id),
  }));
  const viewer = members.find((member) => Number(member.id) === Number(req.user.id));
  const canManageMembers = Number(project.owner_id) === Number(req.user.id) || viewer?.role === 'admin';

  res.json({
    project: { ...serializeProject(project), members, can_manage_members: canManageMembers },
  });
});

router.get('/:id/audit-logs', requireProjectAdmin, async (req, res) => {
  const { rows } = await db.query(
    `SELECT a.id, a.project_id, a.actor_id, a.action, a.entity_type, a.entity_id, a.metadata, a.created_at,
            u.name AS actor_name, u.email AS actor_email
     FROM project_audit_logs a
     LEFT JOIN users u ON u.id = a.actor_id
     WHERE a.project_id = $1
     ORDER BY a.created_at DESC
     LIMIT 250`,
    [req.params.id]
  );
  res.json({
    events: rows.map((row) => ({
      ...row,
      id: String(row.id),
      project_id: String(row.project_id),
      actor_id: row.actor_id == null ? null : String(row.actor_id),
      entity_id: row.entity_id == null ? null : String(row.entity_id),
    })),
  });
});

router.get('/:id/members', requireProjectMember, async (req, res) => {
  const { rows } = await db.query(
    `SELECT u.id, u.name, u.email, u.avatar_url AS "avatarUrl", pm.role,
            (p.owner_id = u.id) AS "isOwner"
     FROM project_members pm
     JOIN users u ON u.id = pm.user_id
     JOIN projects p ON p.id = pm.project_id
     WHERE pm.project_id = $1
     ORDER BY u.name`,
    [req.params.id]
  );
  res.json({ members: rows.map((row) => ({ ...row, id: String(row.id) })) });
});

router.post('/:id/tasks', requireProjectMember, async (req, res) => {
  const { title, description, assignee_id, status, priority, due_date } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title is required' });
  const { rows } = await db.query(
    `INSERT INTO tasks (project_id, title, description, assignee_id, status, priority, due_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [req.params.id, title, description || '', assignee_id || null, status || 'todo', priority || 'medium', due_date || null]
  );
  const { rows: taskRows } = await db.query(
    `SELECT t.*, u.name AS assignee_name FROM tasks t
     LEFT JOIN users u ON u.id = t.assignee_id
     WHERE t.id = $1`,
    [rows[0].id]
  );
  await logProjectActivity({
    projectId: req.params.id,
    actorId: req.user.id,
    action: 'task.created',
    entityType: 'task',
    entityId: rows[0].id,
    metadata: { title: rows[0].title, status: rows[0].status },
  });
  res.status(201).json({ task: serializeTask(taskRows[0]) });
});

router.get('/:id/tasks', requireProjectMember, async (req, res) => {
  const { status, assignee } = req.query;
  const values = [req.params.id];
  let query = `SELECT t.*, u.name AS assignee_name FROM tasks t
     LEFT JOIN users u ON u.id = t.assignee_id
     WHERE t.project_id = $1`;
  let paramIndex = 2;
  if (status) {
    query += ` AND t.status = $${paramIndex}`;
    values.push(status);
    paramIndex += 1;
  }
  if (assignee) {
    query += ` AND t.assignee_id = $${paramIndex}`;
    values.push(assignee);
  }
  query += ' ORDER BY t.created_at DESC';
  const { rows } = await db.query(query, values);
  res.json({ tasks: rows.map(serializeTask) });
});

router.patch('/:id', requireProjectOwner, async (req, res) => {
  const { name, description, color, status } = req.body || {};
  const sets = [];
  const values = [];
  if (name !== undefined) { sets.push(`name = $${sets.length + 1}`); values.push(name); }
  if (description !== undefined) { sets.push(`description = $${sets.length + 1}`); values.push(description); }
  if (color !== undefined) { sets.push(`color = $${sets.length + 1}`); values.push(color); }
  if (status !== undefined) {
    const validStatuses = ['active', 'completed', 'archived'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'invalid status' });
    sets.push(`status = $${sets.length + 1}`);
    values.push(status);
  }
  if (!sets.length) return res.status(400).json({ error: 'nothing to update' });
  values.push(req.params.id);
  await db.query(`UPDATE projects SET ${sets.join(', ')} WHERE id = $${values.length}`, values);
  const { rows } = await db.query(
    `SELECT p.id, p.name, p.description, p.owner_id, p.color, p.status, p.created_at, ${taskAggregates()}
     FROM projects p WHERE p.id = $1`,
    [req.params.id]
  );
  res.json({ project: serializeProject(rows[0]) });
});

router.delete('/:id', requireProjectOwner, async (req, res) => {
  await db.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// Project admins can add an existing account directly and choose its project role.
router.post('/:id/members', requireProjectAdmin, async (req, res) => {
  const { email, role = 'member' } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email is required' });
  if (!INVITATION_ROLES.has(role)) return res.status(400).json({ error: 'invalid project role' });
  const { rows: users } = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (!users.length) return res.status(404).json({ error: 'user not found; send an invitation instead' });
  await db.query(
    `INSERT INTO project_members (project_id, user_id, role)
     VALUES ($1, $2, $3)
     ON CONFLICT (project_id, user_id) DO UPDATE SET role = EXCLUDED.role`,
    [req.params.id, users[0].id, role]
  );
  await logProjectActivity({
    projectId: req.params.id,
    actorId: req.user.id,
    action: 'member.added',
    entityType: 'user',
    entityId: users[0].id,
    metadata: { email: email.toLowerCase(), role },
  });
  res.json({ ok: true });
});

router.delete('/:id/members/:userId', requireProjectAdmin, async (req, res) => {
  const { rows } = await db.query('SELECT owner_id FROM projects WHERE id = $1', [req.params.id]);
  if (Number(rows[0].owner_id) === Number(req.params.userId)) {
    return res.status(400).json({ error: 'The project owner cannot be removed' });
  }
  await db.query('DELETE FROM project_members WHERE project_id = $1 AND user_id = $2', [req.params.id, req.params.userId]);
  await logProjectActivity({
    projectId: req.params.id,
    actorId: req.user.id,
    action: 'member.removed',
    entityType: 'user',
    entityId: req.params.userId,
  });
  res.json({ ok: true });
});

// Project administrators create email-bound, role-aware invitations.
router.post('/:id/invites', requireProjectAdmin, async (req, res) => {
  const { email, role = 'member' } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes('@')) return res.status(400).json({ error: 'a valid email is required' });
  if (!INVITATION_ROLES.has(role)) return res.status(400).json({ error: 'invalid project role' });

  const { rows: projectRows } = await db.query('SELECT name FROM projects WHERE id = $1', [req.params.id]);
  const { rows: existingMembers } = await db.query(
    `SELECT 1 FROM project_members pm JOIN users u ON u.id = pm.user_id
     WHERE pm.project_id = $1 AND lower(u.email) = $2`,
    [req.params.id, normalizedEmail]
  );
  if (existingMembers.length) return res.status(409).json({ error: 'This person is already a project member' });

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.query(
    `UPDATE project_invitations SET status = 'revoked'
     WHERE project_id = $1 AND email = $2 AND status = 'pending'`,
    [req.params.id, normalizedEmail]
  );
  const { rows } = await db.query(
    `INSERT INTO project_invitations (project_id, email, role, token_hash, invited_by, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, email, role, status, invited_by, expires_at, created_at, accepted_at,
               delivery_status, delivery_error, delivery_message_id, delivery_attempted_at`,
    [req.params.id, normalizedEmail, role, hashToken(token), req.user.id, expiresAt]
  );

  await logProjectActivity({
    projectId: req.params.id,
    actorId: req.user.id,
    action: 'member.invited',
    entityType: 'invitation',
    entityId: rows[0].id,
    metadata: { email: normalizedEmail, role },
  });

  const inviteUrl = `${publicAppUrl()}/invite/${token}`;
  const emailResult = await sendProjectInvite({
    recipientEmail: normalizedEmail,
    inviterName: req.user.name || 'A project administrator',
    projectName: projectRows[0].name,
    inviteUrl,
  });

  const deliveryStatus = emailResult.success ? 'sent' : 'failed';
  const deliveryError = emailResult.success ? null : String(emailResult.error || 'Unknown email delivery error').slice(0, 500);
  const { rows: deliveryRows } = await db.query(
    `UPDATE project_invitations
     SET delivery_status = $1,
         delivery_error = $2,
         delivery_message_id = $3,
         delivery_attempted_at = now()
     WHERE id = $4
     RETURNING id, email, role, status, invited_by, expires_at, created_at, accepted_at,
               delivery_status, delivery_error, delivery_message_id, delivery_attempted_at`,
    [deliveryStatus, deliveryError, emailResult.success ? emailResult.messageId : null, rows[0].id]
  );
  const invitation = serializeInvitation(deliveryRows[0]);

  if (!emailResult.success) {
    await logProjectActivity({
      projectId: req.params.id,
      actorId: req.user.id,
      action: 'invitation.delivery_failed',
      entityType: 'invitation',
      entityId: rows[0].id,
      metadata: { email: normalizedEmail, reason: deliveryError },
    });
    return res.status(202).json({
      invite: invitation,
      delivery: { status: deliveryStatus, error: deliveryError },
      warning: 'Invitation was created, but the email was not delivered.',
    });
  }

  res.status(201).json({
    invite: invitation,
    delivery: { status: deliveryStatus, attempted_at: invitation.delivery_attempted_at },
  });
});

router.get('/:id/invites', requireProjectAdmin, async (req, res) => {
  const { rows } = await db.query(
    `SELECT id, email, role, status, invited_by, expires_at, created_at, accepted_at,
            delivery_status, delivery_error, delivery_message_id, delivery_attempted_at
     FROM project_invitations
     WHERE project_id = $1
     ORDER BY created_at DESC`,
    [req.params.id]
  );
  res.json({ invites: rows.map(serializeInvitation) });
});

router.delete('/:id/invites/:inviteId', requireProjectAdmin, async (req, res) => {
  const { rows } = await db.query(
    `UPDATE project_invitations SET status = 'revoked'
     WHERE id = $1 AND project_id = $2 AND status = 'pending'
     RETURNING id`,
    [req.params.inviteId, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Pending invitation not found' });
  await logProjectActivity({
    projectId: req.params.id,
    actorId: req.user.id,
    action: 'invitation.revoked',
    entityType: 'invitation',
    entityId: req.params.inviteId,
  });
  res.json({ ok: true });
});

export default router;
