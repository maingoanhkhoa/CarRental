const pool = require('./db');

async function migrate() {
    try {
        console.log('Creating car_images table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS car_images (
                id SERIAL PRIMARY KEY,
                car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
                image_url TEXT NOT NULL,
                sort_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('car_images table created successfully!');

        // Create index for faster lookups
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_car_images_car_id ON car_images(car_id);
        `);
        console.log('Index created on car_images.car_id');

        console.log('Migration complete!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
