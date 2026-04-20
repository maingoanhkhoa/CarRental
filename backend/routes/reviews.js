const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/reviews — Return all reviews newest first
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM reviews ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews — Create a new review
router.post('/', async (req, res) => {
  try {
    const { name, comment, rating } = req.body;

    if (!name || !comment) {
      return res.status(400).json({ error: 'Name and comment are required' });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }

    if (comment.trim().length < 10) {
      return res.status(400).json({ error: 'Comment must be at least 10 characters' });
    }

    const safeRating = Math.min(5, Math.max(1, parseInt(rating) || 5));

    const result = await db.query(
      'INSERT INTO reviews (name, comment, rating) VALUES ($1, $2, $3) RETURNING *',
      [name.trim(), comment.trim(), safeRating]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
