import express from 'express';
import db from '../db.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all products with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, search, categories } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM products';
    let countQuery = 'SELECT COUNT(*) as count FROM products';
    let params = [];
    let paramCount = 0;

    if (search) {
      const searchTerm = `%${search}%`;
      query += ` WHERE name ILIKE $${++paramCount} OR code ILIKE $${++paramCount} OR brand ILIKE $${++paramCount}`;
      countQuery += ` WHERE name ILIKE $${paramCount - 2} OR code ILIKE $${paramCount - 1} OR brand ILIKE $${paramCount}`;
      params = [searchTerm, searchTerm, searchTerm];
    }

    if (categories) {
      const categoryIds = JSON.parse(categories);
      if (categoryIds.length > 0) {
        const placeholders = categoryIds.map(() => `$${++paramCount}`).join(',');
        query = `
          SELECT DISTINCT p.* FROM products p
          JOIN product_categories pc ON p.id = pc.product_id
          WHERE pc.category_id IN (${placeholders})
          ${search ? `AND (p.name ILIKE $${++paramCount} OR p.code ILIKE $${++paramCount} OR p.brand ILIKE $${++paramCount})` : ''}
        `;
        countQuery = `
          SELECT COUNT(DISTINCT p.id) as count FROM products p
          JOIN product_categories pc ON p.id = pc.product_id
          WHERE pc.category_id IN (${placeholders})
          ${search ? `AND (p.name ILIKE $${paramCount - 2} OR p.code ILIKE $${paramCount - 1} OR p.brand ILIKE $${paramCount})` : ''}
        `;
        params = [...categoryIds, ...(search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [])];
      }
    }

    query += ` ORDER BY created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(limit, offset);

    const countResult = await db.query(countQuery, params.slice(0, paramCount - 2));
    const productsResult = await db.query(query, params);

    res.json({
      data: productsResult.rows || [],
      total: parseInt(countResult.rows[0].count),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM products WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product (admin only)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { name, description, price, code, brand, images, stock_quantity, status } = req.body;

    const result = await db.query(
      `INSERT INTO products (name, description, price, code, brand, images, stock_quantity, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, description, price, code, brand, JSON.stringify(images || []), stock_quantity || 0, status || 'active']
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product (admin only)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { name, description, price, code, brand, images, stock_quantity, status } = req.body;

    const result = await db.query(
      `UPDATE products SET name = $1, description = $2, price = $3, code = $4, brand = $5, images = $6, stock_quantity = $7, status = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 RETURNING *`,
      [name, description, price, code, brand, JSON.stringify(images || []), stock_quantity || 0, status || 'active', req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product (admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
