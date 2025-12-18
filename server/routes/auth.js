import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { generateToken, verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Sign up
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email',
      [email, hashedPassword, 'user']
    );

    const user = result.rows[0];
    const token = generateToken(user.id, user.email, 'user');
    res.json({
      user: { id: user.id, email: user.email },
      session: { access_token: token },
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Sign in
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id, user.email, user.role);
    res.json({
      user: { id: user.id, email: user.email },
      session: { access_token: token },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get session
router.get('/session', verifyToken, async (req, res) => {
  try {
    const result = await db.query('SELECT id, email, role FROM users WHERE id = $1', [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({ user, session: { access_token: req.headers.authorization.split(' ')[1] } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
