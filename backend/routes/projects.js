import express from 'express';
import crypto from 'node:crypto';
import { requireAuth, requireProjectMember, requireProjectOwner } from '../auth.js';
import { db } from '../db.js';
import { serializeTask } from './tasks.js';
import { sendProjectInvite } from '../lib/email.js';

const router = express.Router();
router.use(requireAuth);

// Validate numeric ID parameters
router.param('id', (req, res, next, id) => {
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid project ID' });
  }
  next();
});

router.param('userId', (req, res, next, userId) => {
  if (!/^\d+$/.test(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  next();
});

router.param('inviteId', (req, res, next, inviteId) => {
  if (!/^\d+$/.test(inviteId)) {
    return res.status(400).json({ error: 'Invalid invite ID' });
  }
  next();
});

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

// GET /api/projects — projects the user owns or is a member of
router.get('/', async (req, res) => {
  const { rows } = await db.query(
    `SELECT p.id, p.name, p.description, p.owner_id, p.color, p.status, p.created_at, ${taskAggregates()}
     FROM projects p
     JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $1
     ORDER BY p.created_at DESC`,
    [req.user.id]
  );
  // Fetch member_ids for each project
  const projectIds = rows.map(r => r.id);
  let memberIdsMap = {};
  if (projectIds.length > 0) {
    const { rows: memberRows } = await db.query(
      `SELECT project_id, user_id FROM project_members WHERE project_id = ANY($1)`,
      [projectIds]
    );
    for (const m of memberRows) {
      if (!memberIdsMap[m.project_id]) memberIdsMap[m.project_id] = [];
      memberIdsMap[m.project_id].push(String(m.user_id));
    }
  }
  const projects = rows.map(row => ({
    ...serializeProject(row),
    member_ids: memberIdsMap[row.id] || [],
  }));
  res.json({ projects });
});

// POST /api/projects — create; creator auto-added as owner + member
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
  await db.query('INSERT INTO project_members (project_id, user_id) VALUES ($1, $2)', [
    project.id,
    req.user.id,
  ]);
  res.status(201).json({ project: serializeProject({ ...project, task_count: 0, done_count: 0, member_count: 1 }) });
});

// GET /api/projects/:id — detail + members
router.get('/:id', requireProjectMember, async (req, res) => {
  const { rows } = await db.query(
    `SELECT p.id, p.name, p.description, p.owner_id, p.color, p.status, p.created_at, ${taskAggregates()}
     FROM projects p WHERE p.id = $1`,
    [req.params.id]
  );
  const project = rows[0];
  const { rows: members } = await db.query(
    `SELECT u.id, u.name, u.email, u.avatar_url AS "avatarUrl" FROM project_members pm
     JOIN users u ON u.id = pm.user_id WHERE pm.project_id = $1`,
    [req.params.id]
  );
  res.json({ project: { ...serializeProject(project), members } });
});

// POST /api/projects/:id/tasks — create task (project member)
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
  res.status(201).json({ task: serializeTask(taskRows[0]) });
});

// GET /api/projects/:id/tasks — list tasks (project member)
router.get('/:id/tasks', requireProjectMember, async (req, res) => {
  const { status, assignee } = req.query;
  const vals = [req.params.id];
  let query = `SELECT t.*, u.name AS assignee_name FROM tasks t
     LEFT JOIN users u ON u.id = t.assignee_id
     WHERE t.project_id = $1`;
  let paramIdx = 2;
  if (status) {
    query += ` AND t.status = $${paramIdx}`;
    vals.push(status);
    paramIdx++;
  }
  if (assignee) {
    query += ` AND t.assignee_id = $${paramIdx}`;
    vals.push(assignee);
    paramIdx++;
  }
  query += ` ORDER BY t.created_at DESC`;
  const { rows } = await db.query(query, vals);
  res.json({ tasks: rows.map(serializeTask) });
});

// PATCH /api/projects/:id — owner only
router.patch('/:id', requireProjectOwner, async (req, res) => {
  const { name, description, color, status } = req.body || {};
  const sets = [];
  const vals = [];
  if (name !== undefined) { sets.push(`name = $${sets.length + 1}`); vals.push(name); }
  if (description !== undefined) { sets.push(`description = $${sets.length + 1}`); vals.push(description); }
  if (color !== undefined) { sets.push(`color = $${sets.length + 1}`); vals.push(color); }
  if (status !== undefined) { 
    const validStatuses = ['active', 'completed', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'invalid status' });
    }
    sets.push(`status = $${sets.length + 1}`); 
    vals.push(status); 
  }
  if (!sets.length) return res.status(400).json({ error: 'nothing to update' });
  vals.push(req.params.id);
  const { rows } = await db.query(
    `UPDATE projects SET ${sets.join(', ')} WHERE id = $${vals.length} RETURNING id, name, description, owner_id, color, status, created_at`,
    vals
  );
  // Refetch the project with accurate counts
  const { rows: projectRows } = await db.query(
    `SELECT p.id, p.name, p.description, p.owner_id, p.color, p.status, p.created_at, ${taskAggregates()}
     FROM projects p WHERE p.id = $1`,
    [req.params.id]
  );
  const project = projectRows[0];
  res.json({ project: serializeProject(project) });
});

// DELETE /api/projects/:id — owner only
router.delete('/:id', requireProjectOwner, async (req, res) => {
  await db.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// POST /api/projects/:id/members — owner only; errors if user not registered
router.post('/:id/members', requireProjectOwner, async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email is required' });
  const norm = email.toLowerCase();
  const { rows: users } = await db.query('SELECT id FROM users WHERE email = $1', [norm]);
  if (!users.length) return res.status(404).json({ error: 'user not found; ask them to sign up first' });
  const userId = users[0].id;
  await db.query('INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.params.id, userId]);
  res.json({ ok: true });
});

// DELETE /api/projects/:id/members/:userId — owner only
router.delete('/:id/members/:userId', requireProjectOwner, async (req, res) => {
  await db.query('DELETE FROM project_members WHERE project_id = $1 AND user_id = $2', [req.params.id, req.params.userId]);
  res.json({ ok: true });
});

// POST /api/projects/:id/invites — owner only
router.post('/:id/invites', requireProjectOwner, async (req, res) => {
  const { email } = req.body || {};
  const token = crypto.randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.query(
    `INSERT INTO project_invites (project_id, token, email, created_by, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [req.params.id, token, email || null, req.user.id, expiresAt]
  );

  const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${token}`;

  if (email) {
    const { rows } = await db.query('SELECT name FROM projects WHERE id = $1', [req.params.id]);
    const projectName = rows[0]?.name || 'a project';
    const inviterName = req.user.name || 'A team member';

    const emailResult = await sendProjectInvite({
      recipientEmail: email,
      inviterName,
      projectName,
      inviteUrl,
    });

    if (!emailResult.success) {
      console.warn(`[INVITE] Email failed: ${emailResult.error}`);
      return res.json({
        invite: { token, url: inviteUrl, email, expires_at: expiresAt },
        warning: 'Invitation created but email failed to send',
      });
    }
  }

  res.json({ invite: { token, url: inviteUrl, email, expires_at: expiresAt } });
});

// GET /api/projects/:id/invites — owner only; list pending invites
router.get('/:id/invites', requireProjectOwner, async (req, res) => {
  const { rows } = await db.query(
    `SELECT id, token, email, created_by, expires_at, used_at FROM project_invites WHERE project_id = $1 ORDER BY created_at DESC`,
    [req.params.id]
  );
  res.json({ invites: rows.map(r => ({
    id: String(r.id), token: r.token, email: r.email, created_by: String(r.created_by),
    expires_at: r.expires_at, used_at: r.used_at,
  })) });
});

// DELETE /api/projects/:id/invites/:inviteId — owner only; cancel invite
router.delete('/:id/invites/:inviteId', requireProjectOwner, async (req, res) => {
  await db.query('DELETE FROM project_invites WHERE id = $1 AND project_id = $2', [req.params.inviteId, req.params.id]);

  res.json({ success: true, message: 'Invite cancelled' });
});

export default router;
