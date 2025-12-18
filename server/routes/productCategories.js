import express from 'express';
import db from '../db.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get categories for a product
router.get('/:productId', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.id, c.name, c.slug FROM categories c
       JOIN product_categories pc ON c.id = pc.category_id
       WHERE pc.product_id = $1`,
      [req.params.productId]
    );

    res.json(result.rows || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product categories
router.post('/:productId', verifyAdmin, async (req, res) => {
  try {
    const { categoryIds } = req.body;
    const productId = req.params.productId;

    // First, delete existing categories for this product
    await db.query('DELETE FROM product_categories WHERE product_id = $1', [productId]);

    // Then insert new categories
    if (categoryIds && categoryIds.length > 0) {
      for (const categoryId of categoryIds) {
        await db.query(
          'INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2)',
          [productId, categoryId]
        );
      }
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
