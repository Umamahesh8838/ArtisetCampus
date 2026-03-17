require('dotenv').config();
const mysql = require('mysql2/promise');

const SQL_STATEMENTS = [
  // Table: tbl_cp_student_subject_marks
  // Stores semester marks for each student
  `CREATE TABLE IF NOT EXISTS tbl_cp_student_subject_marks (
    marks_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    semester_name VARCHAR(100) NOT NULL,
    subject_name VARCHAR(200) NOT NULL,
    credits INT DEFAULT 0,
    internal_marks FLOAT DEFAULT 0,
    external_marks FLOAT DEFAULT 0,
    total_marks FLOAT DEFAULT 0,
    grade VARCHAR(5) DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    KEY idx_sm_student (student_id)
  )`,

  // Ensure tbl_cp_student has the 'status' column if it doesn't already
  `ALTER TABLE tbl_cp_student ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active'`,

  // Ensure date_of_birth is nullable (common cause of NULL constraint errors)
  `ALTER TABLE tbl_cp_student MODIFY COLUMN date_of_birth DATE NULL`,
];

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'campus5',
    multipleStatements: true,
  });
    const logger = require('./utils/logger');
    logger.info('Running migration on database:', process.env.DB_NAME || 'campus5');

  for (const sql of SQL_STATEMENTS) {
    const preview = sql.trim().split('\n')[0].substring(0, 80);
    try {
      await pool.query(sql);
      logger.info('✅ OK:', preview);
    } catch(e) {
      if (e.code === 'ER_DUP_FIELDNAME' || e.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        logger.warn('⚠️  Already exists (skipped):', preview);
      } else {
        logger.error('❌ FAILED:', preview);
        logger.error('   Error:', e.message);
      }
    }
  }

  // Final check: show all tbl_cp_ tables
  const [tables] = await pool.query("SHOW TABLES LIKE 'tbl_cp_%'");
  logger.info('\n=== All tbl_cp_* tables in', process.env.DB_NAME || 'campus5', '===');
  tables.forEach(t => logger.info(' -', Object.values(t)[0]));

  await pool.end();
  logger.info('\nDone.');
}
main().catch(e => { const logger = require('./utils/logger'); logger.error('Fatal:', e.message); process.exit(1); });
