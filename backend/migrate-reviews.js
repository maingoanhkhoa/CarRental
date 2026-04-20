/**
 * migrate-reviews.js
 * Run once to create the reviews table in PostgreSQL.
 * Usage: node migrate-reviews.js
 */
const db = require('./db');

async function migrate() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(255) NOT NULL,
        comment    TEXT NOT NULL,
        rating     SMALLINT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ reviews table created (or already exists).');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
}

migrate();
