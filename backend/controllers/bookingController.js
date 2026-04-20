const pool = require('../db');

exports.createBooking = async (req, res) => {
    try {
        const { name, email, phone, rental_date, return_date, message } = req.body;
        
        // Basic validation
        if (!name || !phone || !rental_date || !return_date) {
            return res.status(400).json({ error: 'Name, phone, rental date, and return date are required' });
        }

        const newBooking = await pool.query(
            `INSERT INTO bookings (name, email, phone, rental_date, return_date, message) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [name, email || null, phone, rental_date, return_date, message || null]
        );

        res.status(201).json(newBooking.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};
