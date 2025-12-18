import express from 'express';
import db from '../db.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get settings
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM settings WHERE id = $1', ['default']);
    const settings = result.rows[0] || { id: 'default', whatsapp_number: '', store_name: 'Paint Connect' };
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update settings (admin only)
router.put('/', verifyAdmin, async (req, res) => {
  try {
    const { whatsapp_number, store_name, phone_number, address, opening_hours } = req.body;

    const result = await db.query(
      'UPDATE settings SET whatsapp_number = $1, store_name = $2, phone_number = $3, address = $4, opening_hours = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [whatsapp_number, store_name, phone_number, address, opening_hours, 'default']
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
