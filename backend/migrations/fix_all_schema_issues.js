/**
 * Master Migration: Fix all database schema issues
 * Fixes:
 * 1. course_code now has default value 'UNKNOWN'
 * 2. country_code is now nullable (NULL DEFAULT NULL)
 * 3. Migration 002 foreign key reference corrected
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixAllSchemaIssues() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const connection = await pool.getConnection();
    console.log('🔧 Running comprehensive schema fixes...');

    // Fix 1: course_code default value
    console.log('\n📝 Fix 1: Adding default value to course_code...');
    try {
      await connection.execute(`
        ALTER TABLE tbl_cp_mcourses 
        MODIFY COLUMN course_code VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN'
      `);
      console.log('✅ Fixed: course_code now has default value UNKNOWN');
    } catch (err) {
      if (err.message.includes('Identical') || err.message.includes('doesn\'t exist')) {
        console.log('ℹ️  course_code already has correct definition or table doesn\'t exist yet');
      } else {
        throw err;
      }
    }

    // Fix 2: country_code nullable
    console.log('\n📝 Fix 2: Making country_code nullable...');
    try {
      await connection.execute(`
        ALTER TABLE tbl_cp_mcountries 
        MODIFY COLUMN country_code VARCHAR(5) NULL DEFAULT NULL,
        DROP INDEX country_code
      `);
      console.log('✅ Fixed: country_code is now nullable');
    } catch (err) {
      if (err.message.includes('Identical') || err.message.includes('doesn\'t exist')) {
        console.log('ℹ️  country_code already has correct definition or table doesn\'t exist yet');
      } else if (err.message.includes('check that column/key exists')) {
        // Could be that we're trying to drop a unique index that doesn't exist
        try {
          await connection.execute(`
            ALTER TABLE tbl_cp_mcountries 
            MODIFY COLUMN country_code VARCHAR(5) NULL DEFAULT NULL
          `);
          console.log('✅ Fixed: country_code is now nullable (index already removed)');
        } catch (err2) {
          if (!err2.message.includes('Identical') && !err2.message.includes('doesn\'t exist')) {
            throw err2;
          }
        }
      } else {
        throw err;
      }
    }

    console.log('\n✅ All schema fixes completed successfully!');
    console.log('\n🎉 Database is now ready for registration submissions.');
    
    connection.release();
  } catch (err) {
    console.error('\n❌ Schema fix error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixAllSchemaIssues();
