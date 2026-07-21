import express from 'express';
import crypto from 'node:crypto';
import { requireAuth, requireProjectMember, requireProjectOwner } from '../auth.js';
import { db } from '../db.js';
import { serializeTask } from './tasks.js';

const router = express.Router();
router.use(requireAuth);

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
    `SELECT p.id, p.name, p.description, p.owner_id, p.created_at, ${taskAggregates()}
     FROM projects p
     JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $1
     ORDER BY p.created_at DESC`,
    [req.user.id]
  );
  res.json({ projects: rows.map(serializeProject) });
});

// POST /api/projects — create; creator auto-added as owner + member
router.post('/', async (req, res) => {
  const { name, description } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required' });
  const { rows } = await db.query(
    `INSERT INTO projects (name, description, owner_id)
     VALUES ($1, $2, $3)
     RETURNING id, name, description, owner_id, created_at`,
    [name, description || '', req.user.id]
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
    `SELECT p.id, p.name, p.description, p.owner_id, p.created_at, ${taskAggregates()}
     FROM projects p WHERE p.id = $1`,
    [req.params.id]
  );
  const project = rows[0];
  const { rows: members } = await db.query(
    `SELECT u.id, u.name, u.email, u.avatar_url AS "avatarUrl"
     FROM project_members pm JOIN users u ON u.id = pm.user_id
     WHERE pm.project_id = $1 ORDER BY u.name`,
    [req.params.id]
  );
  const result = serializeProject(project);
  result.is_owner = Number(project.owner_id) === Number(req.user.id);
  result.members = members.map((m) => ({
    id: String(m.id),
    name: m.name,
    email: m.email,
    avatarUrl: m.avatarUrl,
    isOwner: m.id === project.owner_id,
  }));
  res.json({ project: result });
});

// PATCH /api/projects/:id — owner only
router.patch('/:id', requireProjectOwner, async (req, res) => {
  const { name, description } = req.body || {};
  const sets = [];
  const vals = [];
  if (name !== undefined) { sets.push(`name = $${sets.length + 1}`); vals.push(name); }
  if (description !== undefined) { sets.push(`description = $${sets.length + 1}`); vals.push(description); }
  if (!sets.length) return res.status(400).json({ error: 'nothing to update' });
  vals.push(req.params.id);
  const { rows } = await db.query(
    `UPDATE projects SET ${sets.join(', ')} WHERE id = $${vals.length} RETURNING id, name, description, owner_id, created_at`,
    vals
  );
  res.json({ project: serializeProject({ ...rows[0], task_count: 0, done_count: 0, member_count: 0 }) });
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
  const { rows } = await db.query(
    'SELECT id, name, email, avatar_url AS "avatarUrl" FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  if (!rows.length) return res.status(404).json({ error: 'user must register first' });
  const user = rows[0];
  await db.query(
    'INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [req.params.id, user.id]
  );
  res.status(201).json({
    member: { id: String(user.id), name: user.name, email: user.email, avatarUrl: user.avatarUrl, isOwner: false },
  });
});

// DELETE /api/projects/:id/members/:userId — owner only
router.delete('/:id/members/:userId', requireProjectOwner, async (req, res) => {
  const { id, userId } = req.params;
  const { rows } = await db.query('SELECT owner_id FROM projects WHERE id = $1', [id]);
  if (rows[0]?.owner_id === Number(userId)) {
    return res.status(400).json({ error: 'cannot remove the project owner' });
  }
  await db.query('DELETE FROM project_members WHERE project_id = $1 AND user_id = $2', [id, userId]);
  res.json({ ok: true });
});

// GET /api/projects/:id/tasks — optional ?status= &assignee= filters
router.get('/:id/tasks', requireProjectMember, async (req, res) => {
  const conds = ['project_id = $1'];
  const vals = [req.params.id];
  if (req.query.status) { vals.push(String(req.query.status)); conds.push(`status = $${vals.length}`); }
  if (req.query.assignee) { vals.push(String(req.query.assignee)); conds.push(`assignee_id = $${vals.length}`); }
  const { rows } = await db.query(
    `SELECT * FROM tasks WHERE ${conds.join(' AND ')} ORDER BY created_at ASC`,
    vals
  );
  res.json({ tasks: rows.map(serializeTask) });
});

// POST /api/projects/:id/tasks
router.post('/:id/tasks', requireProjectMember, async (req, res) => {
  const { title, description, assigneeId, priority, dueDate, status } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title is required' });
  const { rows } = await db.query(
    `INSERT INTO tasks (project_id, title, description, assignee_id, priority, due_date, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [
      req.params.id,
      title,
      description || '',
      assigneeId ? Number(assigneeId) : null,
      priority || 'medium',
      dueDate || null,
      status || 'todo',
    ]
  );
  res.status(201).json({ task: serializeTask(rows[0]) });
});

// --- Invites (owner only) ---

// POST /api/projects/:id/invites — create; returns token + copyable link.
// If `email` is supplied and the user already exists, they are joined immediately.
router.post('/:id/invites', requireProjectOwner, async (req, res) => {
  const { email } = req.body || {};
  const token = crypto.randomBytes(16).toString('hex');
  const normEmail = email ? email.toLowerCase() : null;
  const { rows } = await db.query(
    `INSERT INTO project_invites (project_id, token, email, created_by)
     VALUES ($1, $2, $3, $4) RETURNING id, token, email, expires_at`,
    [req.params.id, token, normEmail, req.user.id]
  );
  const inv = rows[0];
  if (normEmail) {
    const { rows: users } = await db.query('SELECT id FROM users WHERE email = $1', [normEmail]);
    if (users.length) {
      await db.query(
        'INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [req.params.id, users[0].id]
      );
      await db.query('UPDATE project_invites SET used_at = now() WHERE id = $1', [inv.id]);
    }
  }
  res.status(201).json({
    invite: {
      id: String(inv.id),
      token: inv.token,
      email: inv.email,
      expires_at: inv.expires_at,
      link: `/invite/${inv.token}`,
    },
  });
});

// GET /api/projects/:id/invites — list active invites
router.get('/:id/invites', requireProjectOwner, async (req, res) => {
  const { rows } = await db.query(
    `SELECT id, token, email, created_at, expires_at, used_at
     FROM project_invites WHERE project_id = $1 ORDER BY created_at DESC`,
    [req.params.id]
  );
  res.json({
    invites: rows.map((r) => ({
      id: String(r.id),
      token: r.token,
      email: r.email,
      created_at: r.created_at,
      expires_at: r.expires_at,
      used_at: r.used_at,
      link: `/invite/${r.token}`,
      pending: !r.used_at && new Date(r.expires_at).getTime() > Date.now(),
    })),
  });
});

// DELETE /api/projects/:id/invites/:inviteId — revoke
router.delete('/:id/invites/:inviteId', requireProjectOwner, async (req, res) => {
  await db.query('DELETE FROM project_invites WHERE id = $1 AND project_id = $2', [
    req.params.inviteId,
    req.params.id,
  ]);
  res.json({ ok: true });
});

// POST /api/projects/invites/:token/accept — join via shared link (any authed user)
router.post('/invites/:token/accept', async (req, res) => {
  const { rows } = await db.query(
    `SELECT id, project_id, email, expires_at, used_at FROM project_invites WHERE token = $1`,
    [req.params.token]
  );
  const inv = rows[0];
  if (!inv) return res.status(404).json({ error: 'invite not found' });
  if (inv.used_at) return res.status(409).json({ error: 'invite already used' });
  if (new Date(inv.expires_at).getTime() <= Date.now()) {
    return res.status(410).json({ error: 'invite expired' });
  }
  if (inv.email && inv.email !== req.user.email.toLowerCase()) {
    return res.status(403).json({ error: 'this invite is for a different email' });
  }
  await db.query(
    'INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [inv.project_id, req.user.id]
  );
  await db.query('UPDATE project_invites SET used_at = now() WHERE id = $1', [inv.id]);
  res.json({ ok: true, projectId: String(inv.project_id) });
});

export default router;


