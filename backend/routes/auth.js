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
} from '../auth.js';

const router = express.Router();

// Stricter rate limiter for forgot-password: 3 requests per 15 minutes per IP
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { error: 'Too many password reset requests. Please try again later.' },
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
  const user = await verifyCredentials(email, password);
  if (!user) return res.status(401).json({ error: 'invalid email or password' });
  setTokenCookie(res, signToken(user.id));
  res.json({ user: { id: String(user.id), name: user.name, email: user.email } });
});

router.post('/logout', (req, res) => {
  clearTokenCookie(res);
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

// Password reset routes
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

// Update user profile (name, avatar)
router.patch('/profile', requireAuth, async (req, res) => {
  const { name, avatar_url } = req.body || {};
  if (!name && !avatar_url) return res.status(400).json({ error: 'Nothing to update' });
  try {
    const updates = [];
    const values = [];
    let idx = 1;
    if (name) {
      updates.push(`name = $${idx++}`);
      values.push(name);
    }
    if (avatar_url !== undefined) {
      updates.push(`avatar_url = $${idx++}`);
      values.push(avatar_url);
    }
    values.push(req.user.id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, name, email, avatar_url, role`;
    const { rows } = await db.query(query, values);
    res.json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
