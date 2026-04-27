const pool = require('./db');

async function migrate() {
    try {
        console.log('Adding detail columns to cars table...');

        await pool.query(`
            ALTER TABLE cars ADD COLUMN IF NOT EXISTS brand TEXT;
            ALTER TABLE cars ADD COLUMN IF NOT EXISTS model TEXT;
            ALTER TABLE cars ADD COLUMN IF NOT EXISTS year INTEGER;
            ALTER TABLE cars ADD COLUMN IF NOT EXISTS color TEXT;
            ALTER TABLE cars ADD COLUMN IF NOT EXISTS features TEXT;
        `);
        console.log('Columns added successfully!');

        // Update sample data
        console.log('Updating sample data...');
        await pool.query(`
            UPDATE cars SET 
                brand = CASE 
                    WHEN name ILIKE '%Hyundai%' THEN 'Hyundai'
                    WHEN name ILIKE '%Honda%' THEN 'Honda'
                    WHEN name ILIKE '%Toyota%' THEN 'Toyota'
                    WHEN name ILIKE '%Kia%' THEN 'Kia'
                    WHEN name ILIKE '%Mazda%' THEN 'Mazda'
                    WHEN name ILIKE '%Chevrolet%' THEN 'Chevrolet'
                    WHEN name ILIKE '%Ford%' THEN 'Ford'
                    WHEN name ILIKE '%Mitsubishi%' THEN 'Mitsubishi'
                    WHEN name ILIKE '%Vinfast%' THEN 'VinFast'
                    ELSE 'Khác'
                END,
                model = CASE
                    WHEN name ILIKE '%Accent%' THEN 'Accent'
                    WHEN name ILIKE '%City%' THEN 'City'
                    WHEN name ILIKE '%Vios%' THEN 'Vios'
                    WHEN name ILIKE '%Sedona%' THEN 'Sedona'
                    WHEN name ILIKE '%Cruze%' THEN 'Cruze'
                    WHEN name ILIKE '%CX-5%' THEN 'CX-5'
                    WHEN name ILIKE '%Ranger%' THEN 'Ranger'
                    WHEN name ILIKE '%Xpander%' THEN 'Xpander'
                    WHEN name ILIKE '%Fadil%' THEN 'Fadil'
                    ELSE split_part(name, ' ', 2)
                END,
                year = CASE
                    WHEN name ILIKE '%2024%' THEN 2024
                    WHEN name ILIKE '%2023%' THEN 2023
                    WHEN name ILIKE '%2022%' THEN 2022
                    WHEN name ILIKE '%2021%' THEN 2021
                    WHEN name ILIKE '%2020%' THEN 2020
                    WHEN name ILIKE '%2019%' THEN 2019
                    WHEN name ILIKE '%2018%' THEN 2018
                    WHEN name ILIKE '%2017%' THEN 2017
                    ELSE 2023
                END,
                color = CASE 
                    WHEN id % 5 = 0 THEN 'Đen'
                    WHEN id % 5 = 1 THEN 'Trắng'
                    WHEN id % 5 = 2 THEN 'Bạc'
                    WHEN id % 5 = 3 THEN 'Xám'
                    ELSE 'Đỏ'
                END,
                features = 'Điều hòa,Camera lùi,Cảm biến đỗ xe,Bluetooth,Ghế da'
            WHERE brand IS NULL;
        `);

        console.log('Migration complete!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
