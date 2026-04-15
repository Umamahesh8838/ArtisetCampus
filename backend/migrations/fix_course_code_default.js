/**
 * Migration: Fix course_code default value
 * Issue: course_code was NOT NULL with no default, causing registration to fail
 * Solution: Make course_code have a default value of 'UNKNOWN'
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixCourseCodeDefault() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const connection = await pool.getConnection();
    console.log('📝 Running migration: Fix course_code default value...');

    // Modify the column to have default value
    await connection.execute(`
      ALTER TABLE tbl_cp_mcourses 
      MODIFY COLUMN course_code VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN'
    `);

    console.log('✅ Migration completed successfully!');
    console.log('✅ course_code now has default value: UNKNOWN');
    
    connection.release();
  } catch (err) {
    console.error('❌ Migration error:', err.message);
  } finally {
    await pool.end();
  }
}

fixCourseCodeDefault();
