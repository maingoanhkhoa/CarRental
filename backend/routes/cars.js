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

// GET all cars (supports ?seats=5 or ?seats=7 filter)
router.get('/', async (req, res) => {
  try {
    let query = 'SELECT * FROM cars';
    const values = [];
    const conditions = [];

    if (req.query.seats) {
      conditions.push(`seats = $${conditions.length + 1}`);
      values.push(parseInt(req.query.seats, 10));
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY id DESC';

    const result = await db.query(query, values);
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

    const car = result.rows[0];

    // Fetch additional images from car_images table
    const imagesResult = await db.query(
      'SELECT id, image_url, sort_order FROM car_images WHERE car_id = $1 ORDER BY sort_order ASC',
      [req.params.id]
    );
    car.images = imagesResult.rows;

    res.json(car);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;