const pool = require('./db');

async function alterDb() {
    try {
        await pool.query('ALTER TABLE bookings DROP COLUMN IF EXISTS car_id CASCADE;');
        console.log('Dropped car_id column');
        await pool.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS message TEXT;');
        console.log('Added message column');
        process.exit(0);
    } catch (err) {
        console.error('Error altering table', err);
        process.exit(1);
    }
}

alterDb();
