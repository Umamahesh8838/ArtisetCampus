require('dotenv').config();
const mysql = require('mysql2/promise');

const FIXES = [
  // Fix AUTO_INCREMENT on geography master tables
  `ALTER TABLE tbl_cp_mcountries MODIFY COLUMN country_id INT NOT NULL AUTO_INCREMENT`,
  `ALTER TABLE tbl_cp_mstates MODIFY COLUMN state_id INT NOT NULL AUTO_INCREMENT`,
  `ALTER TABLE tbl_cp_mcities MODIFY COLUMN city_id INT NOT NULL AUTO_INCREMENT`,
  `ALTER TABLE tbl_cp_mpincodes MODIFY COLUMN pincode_id INT NOT NULL AUTO_INCREMENT`,
  // Also fix college and course ID columns
  `ALTER TABLE tbl_cp_mcolleges MODIFY COLUMN college_id INT NOT NULL AUTO_INCREMENT`,
  `ALTER TABLE tbl_cp_mcourses MODIFY COLUMN course_id INT NOT NULL AUTO_INCREMENT`,
  `ALTER TABLE tbl_cp_minterests MODIFY COLUMN interest_id INT NOT NULL AUTO_INCREMENT`,
  `ALTER TABLE tbl_cp_mskills MODIFY COLUMN skill_id INT NOT NULL AUTO_INCREMENT`,
  `ALTER TABLE tbl_cp_mlanguages MODIFY COLUMN language_id INT NOT NULL AUTO_INCREMENT`,
  `ALTER TABLE tbl_cp_mcertifications MODIFY COLUMN certification_id INT NOT NULL AUTO_INCREMENT`,
];

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'campus5',
  });

  for (const sql of FIXES) {
    const preview = sql.replace(/\s+/g, ' ').substring(0, 80);
    try {
      await pool.query(sql);
      logger.info('✅', preview);
    } catch(e) {
      if (e.code === 'ER_TABLE_NOT_LOCKED_FOR_WRITE' || e.message.includes('already AUTO_INCREMENT')) {
        logger.warn('⚠️  Skipped (already set):', preview);
      } else {
        logger.error('❌', preview);
        logger.error('   Error:', e.message);
      }
    }
  }

  await pool.end();
  logger.info('\nDone. Restart your backend server now.');
}
main().catch(e => { const logger = require('./utils/logger'); logger.error(e.message); process.exit(1); });
