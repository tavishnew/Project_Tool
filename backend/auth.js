import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import { sendPasswordResetEmail, sendPasswordUpdateCodeEmail } from './lib/email.js';
import { logProjectActivity } from './lib/audit.js';

let SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error('JWT_SECRET must be set');
}
const COOKIE = 'pm_token';

export async function registerUser(name, email, password, role) {
  const hash = await bcrypt.hash(password, 10);
  const normEmail = email.toLowerCase();
  const { rows } = await db.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at`,
    [name, normEmail, hash, role === 'admin' ? 'admin' : 'user']
  );
  const user = rows[0];
  await acceptPendingInvites(normEmail, user.id);
  return user;
}

// On registration, accept all still-valid email-bound project invitations atomically.
async function acceptPendingInvites(email, userId) {
  await db.query('BEGIN');
  try {
    const { rows } = await db.query(
      `SELECT id, project_id, role
       FROM project_invitations
       WHERE email = $1 AND status = 'pending' AND expires_at > now()
       FOR UPDATE`,
      [email]
    );

    for (const invitation of rows) {
      await db.query(
        `INSERT INTO project_members (project_id, user_id, role)
         VALUES ($1, $2, $3)
         ON CONFLICT (project_id, user_id) DO UPDATE SET role = EXCLUDED.role`,
        [invitation.project_id, userId, invitation.role]
      );
      await db.query(
        `UPDATE project_invitations
         SET status = 'accepted', accepted_at = now()
         WHERE id = $1`,
        [invitation.id]
      );
      await logProjectActivity({
        projectId: invitation.project_id,
        actorId: userId,
        action: 'member.added',
        entityType: 'user',
        entityId: userId,
        metadata: { email, role: invitation.role, source: 'registration' },
      });
    }

    await db.query('COMMIT');
  } catch (err) {
    await db.query('ROLLBACK');
    throw err;
  }
}

export async function verifyCredentials(email, password) {
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [String(email || '').trim().toLowerCase()]);
  const user = rows[0];
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password_hash);
  return ok ? user : null;
}

const LOGIN_RECOVERY_THRESHOLD = 5;
const LOGIN_FAILURE_WINDOW_MINUTES = 15;

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

// Record every email equally so the recovery signal never reveals whether an account exists.
export async function recordFailedLoginAttempt(email) {
  const normalizedEmail = normalizeEmail(email);
  const { rows } = await db.query(
    `INSERT INTO login_failure_attempts (email, failure_count, first_failed_at, last_failed_at)
     VALUES ($1, 1, now(), now())
     ON CONFLICT (email) DO UPDATE SET
       failure_count = CASE
         WHEN login_failure_attempts.first_failed_at < now() - INTERVAL '${LOGIN_FAILURE_WINDOW_MINUTES} minutes' THEN 1
         ELSE login_failure_attempts.failure_count + 1
       END,
       first_failed_at = CASE
         WHEN login_failure_attempts.first_failed_at < now() - INTERVAL '${LOGIN_FAILURE_WINDOW_MINUTES} minutes' THEN now()
         ELSE login_failure_attempts.first_failed_at
       END,
       last_failed_at = now()
     RETURNING failure_count`,
    [normalizedEmail]
  );
  const attemptCount = Number(rows[0]?.failure_count || 1);
  return {
    attemptCount,
    attemptsRemaining: Math.max(0, LOGIN_RECOVERY_THRESHOLD - attemptCount),
    recoveryAvailable: attemptCount >= LOGIN_RECOVERY_THRESHOLD,
  };
}

export async function clearFailedLoginAttempts(email) {
  await db.query('DELETE FROM login_failure_attempts WHERE email = $1', [normalizeEmail(email)]);
}

export function signToken(userId) {
  return jwt.sign({ uid: userId }, SECRET, { expiresIn: '7d' });
}

export function setTokenCookie(res, token) {
  const isSecure = process.env.NODE_ENV === 'production';
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    secure: isSecure,
  });
}

export function clearTokenCookie(res) {
  res.clearCookie(COOKIE, { path: '/' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

function publicUser(u) {
  return { id: String(u.id), name: u.name, email: u.email, role: u.role };
}

export async function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE];
  const payload = token && verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'unauthorized' });
  const { rows } = await db.query('SELECT id, name, email, role FROM users WHERE id = $1', [payload.uid]);
  const user = rows[0];
  if (!user) return res.status(401).json({ error: 'unauthorized' });
  req.user = publicUser(user);
  next();
}

export async function requireProjectMember(req, res, next) {
  const { rows } = await db.query(
    'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
    [req.params.id, req.user.id]
  );
  if (!rows.length) return res.status(403).json({ error: 'forbidden' });
  next();
}

export async function requireProjectOwner(req, res, next) {
  const { rows } = await db.query('SELECT owner_id FROM projects WHERE id = $1', [req.params.id]);
  if (!rows.length || Number(rows[0].owner_id) !== Number(req.user.id)) {
    return res.status(403).json({ error: 'forbidden' });
  }
  next();
}

export async function requireProjectAdmin(req, res, next) {
  const { rows } = await db.query(
    `SELECT p.owner_id, pm.role
     FROM projects p
     LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $2
     WHERE p.id = $1`,
    [req.params.id, req.user.id]
  );
  const project = rows[0];
  if (!project || (Number(project.owner_id) !== Number(req.user.id) && project.role !== 'admin')) {
    return res.status(403).json({ error: 'forbidden: project administrators only' });
  }
  next();
}

export async function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'forbidden: admins only' });
  }
  next();
}

export async function requireTaskMember(req, res, next) {
  const { rows } = await db.query('SELECT project_id FROM tasks WHERE id = $1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'not found' });
  const { rows: mem } = await db.query(
    'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
    [rows[0].project_id, req.user.id]
  );
  if (!mem.length) return res.status(403).json({ error: 'forbidden' });
  req.task = { projectId: rows[0].project_id };
  next();
}

// Password reset functions
const crypto = await import('crypto');

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function hashPasswordUpdateCode(email, code) {
  return hashToken(`${normalizeEmail(email)}:${String(code).trim()}`);
}

/**
 * Issues a short-lived, single-use ownership-verification code without revealing
 * whether the supplied email address belongs to an account.
 */
export async function requestPasswordUpdateCode(email) {
  const normEmail = normalizeEmail(email);
  const { rows: attempts } = await db.query(
    'SELECT failure_count FROM login_failure_attempts WHERE email = $1',
    [normEmail]
  );
  if (Number(attempts[0]?.failure_count || 0) < LOGIN_RECOVERY_THRESHOLD) return { success: true };

  const { rows } = await db.query('SELECT id, name FROM users WHERE email = $1', [normEmail]);
  const user = rows[0];
  if (!user) return { success: true };

  const code = crypto.randomInt(100000, 1000000).toString();
  await db.query('DELETE FROM password_update_codes WHERE user_id = $1 AND used_at IS NULL', [user.id]);
  await db.query(
    `INSERT INTO password_update_codes (user_id, code_hash, expires_at)
     VALUES ($1, $2, now() + interval '15 minutes')`,
    [user.id, hashPasswordUpdateCode(normEmail, code)]
  );

  const emailResult = await sendPasswordUpdateCodeEmail({
    recipientEmail: normEmail,
    userName: user.name,
    code,
  });
  if (!emailResult.success) {
    console.warn(`[AUTH] Password update code email failed: ${emailResult.error}`);
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV] Password update code for ${normEmail}: ${code}`);
  }
  return { success: true };
}

/** Replaces a password only after the submitted one-time code proves email ownership. */
export async function completePasswordUpdate({ email, code, password }) {
  const normEmail = normalizeEmail(email);
  const codeHash = hashPasswordUpdateCode(normEmail, code);

  await db.query('BEGIN');
  try {
    const { rows } = await db.query(
      `SELECT puc.id, puc.user_id
       FROM password_update_codes puc
       JOIN users u ON u.id = puc.user_id
       WHERE u.email = $1
         AND puc.code_hash = $2
         AND puc.used_at IS NULL
         AND puc.expires_at > now()
       ORDER BY puc.created_at DESC
       LIMIT 1
       FOR UPDATE`,
      [normEmail, codeHash]
    );
    const verification = rows[0];
    if (!verification) {
      await db.query('ROLLBACK');
      return { success: false, error: 'Invalid or expired verification code' };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, verification.user_id]);
    await db.query('UPDATE password_update_codes SET used_at = now() WHERE user_id = $1 AND used_at IS NULL', [verification.user_id]);
    await db.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [verification.user_id]);
    await db.query('DELETE FROM login_failure_attempts WHERE email = $1', [normEmail]);
    await db.query('COMMIT');
    return { success: true };
  } catch (error) {
    await db.query('ROLLBACK').catch(() => undefined);
    throw error;
  }
}

export async function requestPasswordReset(email) {
  const normEmail = email.toLowerCase();
  const { rows } = await db.query('SELECT id, name FROM users WHERE email = $1', [normEmail]);
  const user = rows[0];
  if (!user) return { success: true }; // Don't reveal if email exists

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);

  // Delete any existing unused tokens for this user
  await db.query('DELETE FROM password_reset_tokens WHERE user_id = $1 AND used_at IS NULL', [user.id]);

  await db.query(
    'INSERT INTO password_reset_tokens (user_id, token_hash) VALUES ($1, $2)',
    [user.id, tokenHash]
  );

  // Send reset email
  const emailResult = await sendPasswordResetEmail({
    recipientEmail: normEmail,
    userName: user.name,
    resetToken: token,
  });

  if (!emailResult.success) {
    console.warn(`[AUTH] Password reset email failed: ${emailResult.error}`);
    // Don't fail the request - token is still valid in DB
  }

  // In development, log the token for testing (do not return in API)
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV] Password reset token for ${email}: ${token}`);
  }

  return { success: true };
}

export async function resetPassword(token, newPassword) {
  const tokenHash = hashToken(token);

  const { rows } = await db.query(
    `SELECT user_id FROM password_reset_tokens
     WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()`,
    [tokenHash]
  );

  const resetToken = rows[0];
  if (!resetToken) return { success: false, error: 'Invalid or expired reset token' };

  const hash = await bcrypt.hash(newPassword, 10);

  await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, resetToken.user_id]);
  await db.query('UPDATE password_reset_tokens SET used_at = now() WHERE user_id = $1', [resetToken.user_id]);
  await db.query(
    'DELETE FROM login_failure_attempts WHERE email = (SELECT email FROM users WHERE id = $1)',
    [resetToken.user_id]
  );

  return { success: true };
}

export async function validateResetToken(token) {
  const tokenHash = hashToken(token);

  const { rows } = await db.query(
    `SELECT user_id FROM password_reset_tokens
     WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()`,
    [tokenHash]
  );

  if (!rows.length) return { valid: false, error: 'Invalid or expired reset token' };

  // Get user email for display
  const { rows: userRows } = await db.query('SELECT email FROM users WHERE id = $1', [rows[0].user_id]);

  return { valid: true, email: userRows[0]?.email };
}

