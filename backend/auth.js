import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

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

// ponytail: on register, auto-join any projects the email was invited to.
async function acceptPendingInvites(email, userId) {
  // Use a transaction to avoid race conditions where multiple registrations for the same email
  // could cause the same invite to be used multiple times.
  await db.query('BEGIN');
  try {
    // Lock the invite rows for update to prevent concurrent transactions from using them
    const { rows } = await db.query(
      `SELECT id, project_id FROM project_invites
       WHERE email = $1 AND used_at IS NULL AND expires_at > now()
       FOR UPDATE`,
      [email]
    );
    for (const inv of rows) {
      // Check again if the invite is still unused (because the lock waits for commit, but we recheck after lock)
      const { rows: invRows } = await db.query(
        'SELECT used_at FROM project_invites WHERE id = $1',
        [inv.id]
      );
      if (invRows[0].used_at !== null) {
        // This invite was already used by another transaction that committed while we were waiting for the lock.
        continue;
      }
      await db.query(
        'INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [inv.project_id, userId]
      );
      await db.query('UPDATE project_invites SET used_at = now() WHERE id = $1', [inv.id]);
    }
    await db.query('COMMIT');
  } catch (err) {
    await db.query('ROLLBACK');
    throw err;
  }
}

export async function verifyCredentials(email, password) {
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  const user = rows[0];
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password_hash);
  return ok ? user : null;
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

export async function requestPasswordReset(email) {
  const normEmail = email.toLowerCase();
  const { rows } = await db.query('SELECT id FROM users WHERE email = $1', [normEmail]);
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
  
  return { success: true };
}

