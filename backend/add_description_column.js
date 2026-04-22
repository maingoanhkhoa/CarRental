const pool = require('./db');

async function migrate() {
    try {
        console.log('Adding description column to cars table...');
        await pool.query('ALTER TABLE cars ADD COLUMN IF NOT EXISTS description TEXT;');
        
        console.log('Updating sample descriptions...');
        await pool.query(`
            UPDATE cars SET description = 'Dòng xe sedan phổ thông, trang bị hiện đại, vận hành êm ái, tiết kiệm nhiên liệu. Phù hợp cho gia đình và công việc.' WHERE name ILIKE '%Hyundai Accent%';
            UPDATE cars SET description = 'Mẫu xe sang trọng, không gian rộng rãi, cảm giác lái chắc chắn. Thích hợp cho những chuyến đi xa và gặp gỡ đối tác.' WHERE name ILIKE '%Cruze%';
            UPDATE cars SET description = 'Xe đô thị linh hoạt, thiết kế năng động, đầy đủ tiện nghi. Lựa chọn tuyệt vời cho di chuyển trong thành phố.' WHERE name ILIKE '%Honda City%';
            UPDATE cars SET description = 'Xe chất lượng cao, bảo dưỡng định kỳ, sạch sẽ và an toàn.' WHERE description IS NULL;
        `);
        
        console.log('Migration successful!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
