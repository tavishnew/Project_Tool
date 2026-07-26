import express from 'express';
import {
  registerUser,
  verifyCredentials,
  signToken,
  setTokenCookie,
  clearTokenCookie,
  requireAuth,
  requestPasswordReset,
  resetPassword,
} from '../auth.js';

const router = express.Router();

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
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email is required' });
  try {
    const result = await requestPasswordReset(email);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password) return res.status(400).json({ error: 'token and password are required' });
  if (password.length < 8) return res.status(400).json({ error: 'password must be at least 8 characters' });
  try {
    const result = await resetPassword(token, password);
    if (!result.success) return res.status(400).json({ error: result.error });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export default router;
