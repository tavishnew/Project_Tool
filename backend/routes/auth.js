import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  registerUser,
  verifyCredentials,
  signToken,
  setTokenCookie,
  clearTokenCookie,
  requireAuth,
  requestPasswordReset,
  resetPassword,
  validateResetToken,
  requestPasswordUpdateCode,
  completePasswordUpdate,
  recordFailedLoginAttempt,
  clearFailedLoginAttempts,
} from '../auth.js';
import { db } from '../db.js';
import { logProjectActivity } from '../lib/audit.js';

const router = express.Router();

// Stricter rate limiter for forgot-password: 3 requests per 15 minutes per IP
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { error: 'Too many password reset requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const sensitiveAccountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many sensitive account actions. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordUpdateCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { error: 'Too many verification code requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required' });
  }
  try {
    const user = await registerUser(name, email, password, role);
    setTokenCookie(res, signToken(user.id));
    res.status(201).json({ user: { id: String(user.id), name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    if (String(e.message).includes('unique')) {
      return res.status(409).json({ error: 'email already registered' });
    }
    throw e;
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const user = await verifyCredentials(normalizedEmail, password);
  if (!user) {
    const recovery = await recordFailedLoginAttempt(normalizedEmail);
    return res.status(401).json({
      error: 'invalid email or password',
      ...recovery,
    });
  }
  await clearFailedLoginAttempts(normalizedEmail);
  setTokenCookie(res, signToken(user.id));
  res.json({ user: { id: String(user.id), name: user.name, email: user.email } });
});

router.post('/logout', (req, res) => {
  clearTokenCookie(res);
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

// Direct, in-page password update after the five-attempt recovery threshold.
router.post('/password-update-code', passwordUpdateCodeLimiter, async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email is required' });
  try {
    await requestPasswordUpdateCode(email);
    // This intentionally never confirms whether the supplied email has an account.
    res.json({ success: true, message: 'If the recovery requirements are met, a verification code has been sent.' });
  } catch (error) {
    console.error('[AUTH] Failed to issue password update code', error);
    res.status(500).json({ error: 'Failed to process password update request' });
  }
});

router.post('/password-update', sensitiveAccountLimiter, async (req, res) => {
  const { email, code, password, passwordConfirmation } = req.body || {};
  if (!email || !code || !password || !passwordConfirmation) {
    return res.status(400).json({ error: 'email, verification code, new password, and password confirmation are required' });
  }
  if (!/^\d{6}$/.test(String(code).trim())) {
    return res.status(400).json({ error: 'Enter the 6-digit verification code' });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ error: 'new password must be at least 8 characters' });
  }
  if (password !== passwordConfirmation) {
    return res.status(400).json({ error: 'new password and confirmation must match' });
  }

  try {
    const result = await completePasswordUpdate({ email, code, password });
    if (!result.success) return res.status(400).json({ error: result.error });
    res.json({ success: true, message: 'Password updated successfully. You can now sign in.' });
  } catch (error) {
    console.error('[AUTH] Failed to complete password update', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Legacy password-reset routes remain available for any previously issued links.
router.post('/forgot-password', forgotPasswordLimiter, async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email is required' });
  try {
    const result = await requestPasswordReset(email);
    // Always return same response to not reveal if email exists
    res.json({ success: true, message: 'If an account exists for this email, a password reset link has been sent.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// GET /api/auth/reset-password/:token — validate reset token
router.get('/reset-password/:token', async (req, res) => {
  try {
    const result = await validateResetToken(req.params.token);
    if (result.valid) {
      res.json({ valid: true, email: result.email });
    } else {
      res.status(400).json({ valid: false, error: result.error });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to validate token' });
  }
});

// POST /api/auth/reset-password/:token — reset password with token in URL
router.post('/reset-password/:token', async (req, res) => {
  const { password } = req.body || {};
  const token = req.params.token;
  if (!password) return res.status(400).json({ error: 'password is required' });
  if (password.length < 8) return res.status(400).json({ error: 'password must be at least 8 characters' });
  try {
    const result = await resetPassword(token, password);
    if (!result.success) return res.status(400).json({ error: result.error });
    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Update profile. Changing the account email requires the current password.
router.patch('/profile', sensitiveAccountLimiter, requireAuth, async (req, res) => {
  const { name, avatar_url, email, currentPassword } = req.body || {};
  if (name === undefined && avatar_url === undefined && email === undefined) {
    return res.status(400).json({ error: 'Nothing to update' });
  }
  try {
    const updates = [];
    const values = [];
    let idx = 1;
    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (!trimmedName) return res.status(400).json({ error: 'name cannot be empty' });
      updates.push(`name = $${idx++}`);
      values.push(trimmedName);
    }
    if (avatar_url !== undefined) {
      updates.push(`avatar_url = $${idx++}`);
      values.push(avatar_url || null);
    }
    if (email !== undefined) {
      const normalizedEmail = String(email).trim().toLowerCase();
      if (!normalizedEmail || !normalizedEmail.includes('@')) return res.status(400).json({ error: 'a valid email is required' });
      if (normalizedEmail !== req.user.email.toLowerCase()) {
        if (!currentPassword) return res.status(401).json({ error: 'current password is required to change email' });
        const verified = await verifyCredentials(req.user.email, currentPassword);
        if (!verified) return res.status(401).json({ error: 'current password is incorrect' });
        updates.push(`email = $${idx++}`);
        values.push(normalizedEmail);
      }
    }
    if (!updates.length) return res.json({ user: req.user });
    values.push(req.user.id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, name, email, avatar_url, role, created_at`;
    const { rows } = await db.query(query, values);
    res.json({ user: rows[0] });
  } catch (err) {
    if (String(err.message).includes('unique')) return res.status(409).json({ error: 'email already registered' });
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password after proving possession of the current password.
router.post('/change-password', sensitiveAccountLimiter, requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'current and new passwords are required' });
  if (String(newPassword).length < 8) return res.status(400).json({ error: 'new password must be at least 8 characters' });

  const user = await verifyCredentials(req.user.email, currentPassword);
  if (!user) return res.status(401).json({ error: 'current password is incorrect' });
  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, req.user.id]);
  await db.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [req.user.id]);
  setTokenCookie(res, signToken(req.user.id));
  res.json({ ok: true, message: 'Password changed successfully.' });
});

// Returns current sole-owner projects and their eligible ownership-transfer recipients.
router.get('/account-deletion-options', requireAuth, async (req, res) => {
  const { rows: projects } = await db.query(
    'SELECT id, name FROM projects WHERE owner_id = $1 ORDER BY name',
    [req.user.id]
  );
  const projectIds = projects.map((project) => project.id);
  const membersByProject = new Map(projectIds.map((projectId) => [projectId, []]));
  if (projectIds.length) {
    const { rows: members } = await db.query(
      `SELECT pm.project_id, u.id, u.name, u.email
       FROM project_members pm
       JOIN users u ON u.id = pm.user_id
       WHERE pm.project_id = ANY($1) AND pm.user_id <> $2
       ORDER BY u.name`,
      [projectIds, req.user.id]
    );
    for (const member of members) {
      membersByProject.get(member.project_id).push({ id: String(member.id), name: member.name, email: member.email });
    }
  }
  res.json({
    ownedProjects: projects.map((project) => ({
      id: String(project.id),
      name: project.name,
      eligibleMembers: membersByProject.get(project.id),
    })),
  });
});

// Delete an account only after its owner transfers every owned project to an existing member.
router.delete('/account', sensitiveAccountLimiter, requireAuth, async (req, res) => {
  const { currentPassword, transfers } = req.body || {};
  if (!currentPassword) return res.status(401).json({ error: 'current password is required to delete your account' });
  if (!Array.isArray(transfers)) return res.status(400).json({ error: 'ownership transfers are required' });

  const user = await verifyCredentials(req.user.email, currentPassword);
  if (!user) return res.status(401).json({ error: 'current password is incorrect' });

  await db.query('BEGIN');
  try {
    const { rows: ownedProjects } = await db.query(
      'SELECT id, name FROM projects WHERE owner_id = $1 FOR UPDATE',
      [req.user.id]
    );
    const transferByProject = new Map(transfers.map((transfer) => [String(transfer.projectId), String(transfer.newOwnerId)]));

    for (const project of ownedProjects) {
      const newOwnerId = transferByProject.get(String(project.id));
      if (!newOwnerId || !/^\d+$/.test(newOwnerId)) {
        await db.query('ROLLBACK');
        return res.status(400).json({ error: `Choose an existing member to own “${project.name}” before deleting your account.` });
      }
      const { rows: eligible } = await db.query(
        'SELECT id, name, email FROM users WHERE id = $1 AND id <> $2 AND EXISTS (SELECT 1 FROM project_members WHERE project_id = $3 AND user_id = $1)',
        [newOwnerId, req.user.id, project.id]
      );
      if (!eligible.length) {
        await db.query('ROLLBACK');
        return res.status(400).json({ error: `The selected new owner for “${project.name}” must already be a project member.` });
      }
      await db.query('UPDATE projects SET owner_id = $1 WHERE id = $2', [newOwnerId, project.id]);
      await db.query(
        `INSERT INTO project_members (project_id, user_id, role)
         VALUES ($1, $2, 'admin')
         ON CONFLICT (project_id, user_id) DO UPDATE SET role = 'admin'`,
        [project.id, newOwnerId]
      );
      await logProjectActivity({
        projectId: project.id,
        actorId: req.user.id,
        action: 'project.ownership_transferred',
        entityType: 'project',
        entityId: project.id,
        metadata: { newOwnerId, newOwnerEmail: eligible[0].email, reason: 'account_deletion' },
      });
    }

    // Remove outstanding tokens and invitations created by this account before deleting it.
    await db.query('DELETE FROM project_invitations WHERE invited_by = $1', [req.user.id]);
    await db.query('DELETE FROM project_invites WHERE created_by = $1', [req.user.id]);
    await db.query('DELETE FROM workspace_invites WHERE created_by = $1', [req.user.id]);
    await db.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    await db.query('COMMIT');
    clearTokenCookie(res);
    res.json({ ok: true });
  } catch (err) {
    await db.query('ROLLBACK').catch(() => undefined);
    console.error('[ACCOUNT] Failed to delete account', err);
    res.status(500).json({ error: 'Unable to delete account' });
  }
});

export default router;
