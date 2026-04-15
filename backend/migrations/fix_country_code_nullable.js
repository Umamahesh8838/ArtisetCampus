/**
 * Migration: Make country_code column nullable
 * Issue: Registration was failing because country_code doesn't have a default value
 * Solution: Make it nullable with default NULL
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixCountryCode() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const connection = await pool.getConnection();
    console.log('📝 Running migration: Make country_code nullable...');

    // Modify the column to be nullable with default NULL
    await connection.execute(`
      ALTER TABLE tbl_cp_mcountries 
      MODIFY COLUMN country_code VARCHAR(5) NULL DEFAULT NULL
    `);

    console.log('✅ Migration completed successfully!');
    console.log('✅ country_code is now nullable with default NULL');
    
    connection.release();
  } catch (err) {
    if (err.message.includes('Duplicate key')) {
      console.log('ℹ️ Note: country_code column might already have UNIQUE constraint removed');
    }
    console.error('❌ Migration error:', err.message);
  } finally {
    await pool.end();
  }
}

fixCountryCode();
