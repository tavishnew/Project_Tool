import crypto from 'node:crypto';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../auth.js';
import { db } from '../db.js';
import { logProjectActivity } from '../lib/audit.js';

const router = express.Router();
const acceptInviteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many invitation acceptance attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function validToken(token) {
  return /^[a-f0-9]{64}$/i.test(token);
}

function serializeInvitation(row) {
  return {
    projectId: String(row.project_id),
    projectName: row.project_name,
    email: row.email,
    role: row.role,
    expiresAt: row.expires_at,
  };
}

// A bearer token is required to see invite details; no account information is exposed.
router.get('/:token', async (req, res) => {
  if (!validToken(req.params.token)) return res.status(404).json({ error: 'Invitation not found' });

  const { rows } = await db.query(
    `SELECT i.project_id, i.email, i.role, i.expires_at, p.name AS project_name
     FROM project_invitations i
     JOIN projects p ON p.id = i.project_id
     WHERE i.token_hash = $1 AND i.status = 'pending' AND i.expires_at > now()`,
    [hashToken(req.params.token)]
  );

  if (!rows.length) return res.status(404).json({ error: 'Invitation not found or expired' });
  res.json({ invitation: serializeInvitation(rows[0]) });
});

// Existing signed-in users can consume a matching email-bound invitation.
router.post('/:token/accept', acceptInviteLimiter, requireAuth, async (req, res) => {
  if (!validToken(req.params.token)) return res.status(404).json({ error: 'Invitation not found' });

  await db.query('BEGIN');
  try {
    const { rows } = await db.query(
      `SELECT id, project_id, email, role, status, expires_at
       FROM project_invitations
       WHERE token_hash = $1
       FOR UPDATE`,
      [hashToken(req.params.token)]
    );
    const invitation = rows[0];

    if (!invitation || invitation.status !== 'pending' || new Date(invitation.expires_at) <= new Date()) {
      await db.query('ROLLBACK');
      return res.status(400).json({ error: 'Invitation is invalid or expired' });
    }
    if (invitation.email.toLowerCase() !== req.user.email.toLowerCase()) {
      await db.query('ROLLBACK');
      return res.status(403).json({ error: 'Sign in with the invited email address to accept this invitation' });
    }

    await db.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (project_id, user_id) DO UPDATE SET role = EXCLUDED.role`,
      [invitation.project_id, req.user.id, invitation.role]
    );
    await db.query(
      `UPDATE project_invitations
       SET status = 'accepted', accepted_at = now()
       WHERE id = $1`,
      [invitation.id]
    );
    await logProjectActivity({
      projectId: invitation.project_id,
      actorId: req.user.id,
      action: 'member.added',
      entityType: 'user',
      entityId: req.user.id,
      metadata: { email: req.user.email, role: invitation.role, source: 'invitation' },
    });
    await db.query('COMMIT');

    res.json({ ok: true, projectId: String(invitation.project_id), role: invitation.role });
  } catch (err) {
    await db.query('ROLLBACK').catch(() => undefined);
    console.error('[PROJECT INVITATION] Failed to accept invitation', err);
    res.status(500).json({ error: 'Unable to accept invitation' });
  }
});

export default router;
