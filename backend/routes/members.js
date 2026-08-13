import express from 'express';
import { requireAuth } from '../auth.js';
import { db } from '../db.js';

const router = express.Router();
router.use(requireAuth);

// GET /members — list all users
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, name, email, role FROM users ORDER BY name`
    );
    const members = rows.map((user) => ({
      id: String(user.id),
      name: user.name,
      email: user.email,
      avatarUrl: null, // We don't have avatar storage
      isOwner: user.role === 'admin', // Treat admins as owners
      color: null,
    }));
    res.json({ members });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
  }
});

// POST /members — get user by email (invite existing user)
router.post('/', async (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: 'email is required' });
  }
  try {
    const { rows } = await db.query(
      'SELECT id, name, email, role FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'user not found' });
    }
    const user = rows[0];
    const member = {
      id: String(user.id),
      name: user.name,
      email: user.email,
      avatarUrl: null,
      isOwner: user.role === 'admin',
      color: null,
    };
    res.json({ member });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
  }
});

// DELETE /members/:userId — delete a user (use with caution)
router.delete('/:userId', async (req, res) => {
  const userId = req.params.userId;
  // Prevent deleting yourself? Not implemented.
  try {
    // Start a transaction to delete related data (though cascades should handle it)
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      // Delete the user (cascades to projects, project_members, project_invites, and sets assignee_id to null in tasks)
      await client.query('DELETE FROM users WHERE id = $1', [userId]);
      await client.query('COMMIT');
      client.release();
    } catch (err) {
      await client.query('ROLLBACK').catch(() => undefined);
      client.release();
      throw err;
    }
    res.json({ ok: true });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
  }
});

export default router;