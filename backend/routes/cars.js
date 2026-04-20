const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadCloud');
const db = require('../db');

// POST /api/cars
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      message: 'Upload success',
      image_url: req.file.path
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all cars
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM cars ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// GET detail car
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM cars WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;