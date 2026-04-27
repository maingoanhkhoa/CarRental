const pool = require('../db');

exports.getCars = async (req, res) => {
    try {
        let query = 'SELECT * FROM cars';
        let values = [];
        let conditions = [];

        if (req.query.seats) {
            conditions.push(`seats = $${conditions.length + 1}`);
            values.push(parseInt(req.query.seats, 10));
        }
        if (req.query.transmission) {
            conditions.push(`transmission = $${conditions.length + 1}`);
            values.push(req.query.transmission);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getCarById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM cars WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Car not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};
