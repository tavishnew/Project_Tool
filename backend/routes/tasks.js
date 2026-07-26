import express from 'express';
import { requireAuth, requireTaskMember } from '../auth.js';
import { db } from '../db.js';

const router = express.Router();
router.use(requireAuth);

// Validate numeric ID parameters
router.param('id', (req, res, next, id) => {
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }
  next();
});

export function serializeTask(row) {
  return {
    id: String(row.id),
    project_id: String(row.project_id),
    title: row.title,
    description: row.description,
    assignee_id: row.assignee_id != null ? String(row.assignee_id) : null,
    status: row.status,
    priority: row.priority,
    due_date: row.due_date,
    created_at: row.created_at,
  };
}

// PATCH /api/tasks/:id — update any allowed field
router.patch('/:id', requireTaskMember, async (req, res) => {
  const { status, assigneeId, assignee_id, dueDate, priority, title, description } = req.body || {};
  const sets = [];
  const vals = [];
  if (status !== undefined) {
    const validStatuses = ['todo', 'in_progress', 'review', 'done'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'invalid status' });
    }
    sets.push(`status = $${sets.length + 1}`);
    vals.push(status);
  }
  // Support both assigneeId and assignee_id (snake_case from frontend)
  const finalAssigneeId = assigneeId !== undefined ? assigneeId : assignee_id;
  if (finalAssigneeId !== undefined) {
    // If assigneeId is an empty string, treat as null (unassign)
    let value = null;
    if (finalAssigneeId !== '') {
      const num = Number(finalAssigneeId);
      if (!isNaN(num)) {
        value = num;
      }
    }
    sets.push(`assignee_id = $${sets.length + 1}`);
    vals.push(value);
  }
  if (dueDate !== undefined) { sets.push(`due_date = $${sets.length + 1}`); vals.push(dueDate || null); }
  if (priority !== undefined) {
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ error: 'invalid priority' });
    }
    sets.push(`priority = $${sets.length + 1}`);
    vals.push(priority);
  }
  if (title !== undefined) { sets.push(`title = $${sets.length + 1}`); vals.push(title); }
  if (description !== undefined) { sets.push(`description = $${sets.length + 1}`); vals.push(description); }
  if (!sets.length) return res.status(400).json({ error: 'nothing to update' });
  vals.push(req.params.id);
  const { rows } = await db.query(
    `UPDATE tasks SET ${sets.join(', ')} WHERE id = $${vals.length} RETURNING *`,
    vals
  );
  res.json({ task: serializeTask(rows[0]) });
});

// DELETE /api/tasks/:id
router.delete('/:id', requireTaskMember, async (req, res) => {
  await db.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

export default router;
