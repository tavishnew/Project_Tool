import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

const SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-change-me';
const COOKIE = 'pm_token';
const MAX_AGE = 7 * 24 * 60 * 60 * 1000;

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
  const { rows } = await db.query(
    `SELECT id, project_id FROM project_invites
     WHERE email = $1 AND used_at IS NULL AND expires_at > now()`,
    [email]
  );
  for (const inv of rows) {
    await db.query(
      'INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [inv.project_id, userId]
    );
    await db.query('UPDATE project_invites SET used_at = now() WHERE id = $1', [inv.id]);
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
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
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
  const { rows } = await db.query('SELECT id, name, email FROM users WHERE id = $1', [payload.uid]);
  const { rows: roleRows } = await db.query('SELECT role FROM users WHERE id = $1', [payload.uid]);
  const user = roleRows[0] ? { ...rows[0], role: roleRows[0].role } : rows[0];
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
