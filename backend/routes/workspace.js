import express from 'express';
import crypto from 'node:crypto';
import { requireAuth, requireAdmin } from '../auth.js';
import { db } from '../db.js';
import { sendWorkspaceInvite } from '../lib/email.js';

const router = express.Router();
router.use(requireAuth);

// GET /api/workspace/invites — list pending workspace invites (admin only)
router.get('/invites', requireAdmin, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, token, email, created_by, expires_at, used_at FROM workspace_invites ORDER BY expires_at DESC`
    );
    res.json({ invites: rows.map(r => ({
      id: String(r.id), token: r.token, email: r.email,
      created_by: String(r.created_by), expires_at: r.expires_at, used_at: r.used_at
    })) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
  }
});

// POST /api/workspace/invites — create workspace invite (admin only)
router.post('/invites', requireAdmin, async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email is required' });
  const norm = email.toLowerCase();

  try {
    // Check if user already exists
    const { rows: users } = await db.query('SELECT id FROM users WHERE email = $1', [norm]);
    if (users.length) {
      return res.status(400).json({ error: 'User already exists in workspace' });
    }

    // Check for existing pending invite
    const { rows: existing } = await db.query(
      `SELECT id FROM workspace_invites WHERE email = $1 AND used_at IS NULL AND expires_at > now()`,
      [norm]
    );
    if (existing.length) {
      return res.status(400).json({ error: 'Pending invite already exists for this email' });
    }

    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.query(
      `INSERT INTO workspace_invites (token, email, created_by, expires_at) VALUES ($1, $2, $3, $4)`,
      [token, norm, req.user.id, expiresAt]
    );

    const workspaceName = process.env.WORKSPACE_NAME || 'Orbit';
    const inviterName = req.user.name || 'A team member';

    const emailResult = await sendWorkspaceInvite({
      recipientEmail: norm,
      inviterName,
      workspaceName,
      invitationToken: token,
    });

    if (!emailResult.success) {
      console.warn(`[WORKSPACE INVITE] Email failed: ${emailResult.error}`);
      return res.json({
        invite: { token, email: norm, expires_at: expiresAt },
        warning: 'Invitation created but email failed to send'
      });
    }

    res.json({
      invite: { token, email: norm, expires_at: expiresAt },
      message: 'Invitation email sent successfully.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
  }
});

// DELETE /api/workspace/invites/:inviteId — cancel invite (admin only)
router.delete('/invites/:inviteId', requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM workspace_invites WHERE id = $1', [req.params.inviteId]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
  }
});

// POST /api/workspace/invites/:token/accept — accept workspace invite (public)
router.post('/invites/:token/accept', async (req, res) => {
  const { token } = req.params;
  const { name, password } = req.body || {};

  if (!name || !password) {
    return res.status(400).json({ error: 'name and password required' });
  }

  try {
    const { rows: invites } = await db.query(
      `SELECT id, email, expires_at, used_at FROM workspace_invites WHERE token = $1`,
      [token]
    );
    if (!invites.length) return res.status(404).json({ error: 'Invalid invite' });
    const invite = invites[0];
    if (invite.used_at) return res.status(400).json({ error: 'Invite already used' });
    if (new Date(invite.expires_at) < new Date()) return res.status(400).json({ error: 'Invite expired' });

    // Create user account
    const bcrypt = await import('bcryptjs');
    const password_hash = await bcrypt.hash(password, 10);

    const { rows: users } = await db.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'user') RETURNING id, email`,
      [name, invite.email, password_hash]
    );
    const user = users[0];

    // Mark invite as used
    await db.query('UPDATE workspace_invites SET used_at = now() WHERE id = $1', [invite.id]);

    res.json({ ok: true, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
  }
});

export default router;