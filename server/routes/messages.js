import express from 'express';
import db from '../db.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Create contact message
router.post('/', async (req, res) => {
  try {
    const { name, phone, message, email } = req.body;

    if (!name || !phone || !message) {
      return res.status(400).json({ error: 'Name, phone, and message required' });
    }

    const result = await db.query(
      'INSERT INTO contact_messages (name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email || null, phone, message]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all messages (admin only)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const result = await db.query(
      'SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    res.json(result.rows || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark message as read (admin only)
router.put('/:id/read', verifyAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE contact_messages SET read = true WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete message (admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM contact_messages WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
