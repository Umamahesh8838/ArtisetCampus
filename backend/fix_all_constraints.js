require('dotenv').config();
const mysql = require('mysql2/promise');

// This script makes all non-PK, non-auto-increment columns in registration tables
// either NULL-able or gives them a sensible default. This eliminates ALL
// "Field X doesn't have a default value" errors in one go.

const NULLABLE_FIXES = [
  // === tbl_cp_student ===
  `ALTER TABLE tbl_cp_student MODIFY COLUMN salutation_id INT NULL`,
  `ALTER TABLE tbl_cp_student MODIFY COLUMN first_name VARCHAR(100) NULL`,
  `ALTER TABLE tbl_cp_student MODIFY COLUMN last_name VARCHAR(100) NULL`,
  `ALTER TABLE tbl_cp_student MODIFY COLUMN email VARCHAR(255) NULL`,
  `ALTER TABLE tbl_cp_student MODIFY COLUMN contact_number VARCHAR(20) NULL`,
  `ALTER TABLE tbl_cp_student MODIFY COLUMN date_of_birth DATE NULL`,
  `ALTER TABLE tbl_cp_student MODIFY COLUMN gender VARCHAR(20) NULL`,
  `ALTER TABLE tbl_cp_student MODIFY COLUMN linkedin_url VARCHAR(500) NULL`,
  `ALTER TABLE tbl_cp_student MODIFY COLUMN github_url VARCHAR(500) NULL`,
  `ALTER TABLE tbl_cp_student MODIFY COLUMN user_type VARCHAR(50) NULL DEFAULT 'Student'`,
  `ALTER TABLE tbl_cp_student MODIFY COLUMN is_active TINYINT(1) NULL DEFAULT 1`,
  `ALTER TABLE tbl_cp_student MODIFY COLUMN status VARCHAR(20) NULL DEFAULT 'Active'`,
  
  // === tbl_cp_student_address ===
  `ALTER TABLE tbl_cp_student_address MODIFY COLUMN address_id INT NOT NULL AUTO_INCREMENT`,
  `ALTER TABLE tbl_cp_student_address MODIFY COLUMN student_id INT NULL`,
  `ALTER TABLE tbl_cp_student_address MODIFY COLUMN address_line_1 VARCHAR(255) NULL`,
  `ALTER TABLE tbl_cp_student_address MODIFY COLUMN address_line_2 VARCHAR(255) NULL`,
  `ALTER TABLE tbl_cp_student_address MODIFY COLUMN landmark VARCHAR(255) NULL`,
  `ALTER TABLE tbl_cp_student_address MODIFY COLUMN pincode_id INT NULL`,
  `ALTER TABLE tbl_cp_student_address MODIFY COLUMN address_type VARCHAR(50) NULL DEFAULT 'current'`,

  // === tbl_cp_student_school ===
  `ALTER TABLE tbl_cp_student_school MODIFY COLUMN school_id INT NOT NULL AUTO_INCREMENT`,
  `ALTER TABLE tbl_cp_student_school MODIFY COLUMN student_id INT NULL`,
  `ALTER TABLE tbl_cp_student_school MODIFY COLUMN standard VARCHAR(10) NULL`,
  `ALTER TABLE tbl_cp_student_school MODIFY COLUMN board VARCHAR(100) NULL`,
  `ALTER TABLE tbl_cp_student_school MODIFY COLUMN school_name VARCHAR(255) NULL`,
  `ALTER TABLE tbl_cp_student_school MODIFY COLUMN percentage FLOAT NULL`,
  `ALTER TABLE tbl_cp_student_school MODIFY COLUMN passing_year VARCHAR(10) NULL`,

  // === tbl_cp_student_education ===
  `ALTER TABLE tbl_cp_student_education MODIFY COLUMN edu_id INT NOT NULL AUTO_INCREMENT`,
  `ALTER TABLE tbl_cp_student_education MODIFY COLUMN student_id INT NULL`,
  `ALTER TABLE tbl_cp_student_education MODIFY COLUMN college_id INT NULL`,
  `ALTER TABLE tbl_cp_student_education MODIFY COLUMN course_id INT NULL`,
  `ALTER TABLE tbl_cp_student_education MODIFY COLUMN start_year VARCHAR(10) NULL`,
  `ALTER TABLE tbl_cp_student_education MODIFY COLUMN end_year VARCHAR(10) NULL`,
  `ALTER TABLE tbl_cp_student_education MODIFY COLUMN cgpa FLOAT NULL DEFAULT 0`,
  `ALTER TABLE tbl_cp_student_education MODIFY COLUMN percentage FLOAT NULL DEFAULT 0`,

  // === tbl_cp_student_workexp ===
  `ALTER TABLE tbl_cp_student_workexp MODIFY COLUMN workexp_id INT NOT NULL AUTO_INCREMENT`,
  `ALTER TABLE tbl_cp_student_workexp MODIFY COLUMN student_id INT NULL`,
  `ALTER TABLE tbl_cp_student_workexp MODIFY COLUMN company_name VARCHAR(255) NULL`,
  `ALTER TABLE tbl_cp_student_workexp MODIFY COLUMN company_location VARCHAR(255) NULL`,
  `ALTER TABLE tbl_cp_student_workexp MODIFY COLUMN designation VARCHAR(255) NULL`,
  `ALTER TABLE tbl_cp_student_workexp MODIFY COLUMN employment_type VARCHAR(50) NULL DEFAULT 'Full-Time'`,
  `ALTER TABLE tbl_cp_student_workexp MODIFY COLUMN start_date DATE NULL`,
  `ALTER TABLE tbl_cp_student_workexp MODIFY COLUMN end_date DATE NULL`,
  `ALTER TABLE tbl_cp_student_workexp MODIFY COLUMN is_current TINYINT(1) NULL DEFAULT 0`,

  // === tbl_cp_studentprojects ===
  `ALTER TABLE tbl_cp_studentprojects MODIFY COLUMN project_id INT NOT NULL AUTO_INCREMENT`,
  `ALTER TABLE tbl_cp_studentprojects MODIFY COLUMN student_id INT NULL`,
  `ALTER TABLE tbl_cp_studentprojects MODIFY COLUMN project_title VARCHAR(255) NULL`,
  `ALTER TABLE tbl_cp_studentprojects MODIFY COLUMN project_description TEXT NULL`,
  `ALTER TABLE tbl_cp_studentprojects MODIFY COLUMN achievements TEXT NULL`,
  `ALTER TABLE tbl_cp_studentprojects MODIFY COLUMN project_start_date DATE NULL`,
  `ALTER TABLE tbl_cp_studentprojects MODIFY COLUMN project_end_date DATE NULL`,

  // === tbl_cp_student_subject_marks ===
  `ALTER TABLE tbl_cp_student_subject_marks MODIFY COLUMN marks_id INT NOT NULL AUTO_INCREMENT`,
  `ALTER TABLE tbl_cp_student_subject_marks MODIFY COLUMN student_id INT NULL`,
  `ALTER TABLE tbl_cp_student_subject_marks MODIFY COLUMN semester_name VARCHAR(100) NULL`,
  `ALTER TABLE tbl_cp_student_subject_marks MODIFY COLUMN subject_name VARCHAR(200) NULL`,
  `ALTER TABLE tbl_cp_student_subject_marks MODIFY COLUMN credits INT NULL DEFAULT 0`,
  `ALTER TABLE tbl_cp_student_subject_marks MODIFY COLUMN internal_marks FLOAT NULL DEFAULT 0`,
  `ALTER TABLE tbl_cp_student_subject_marks MODIFY COLUMN external_marks FLOAT NULL DEFAULT 0`,
  `ALTER TABLE tbl_cp_student_subject_marks MODIFY COLUMN total_marks FLOAT NULL DEFAULT 0`,
  `ALTER TABLE tbl_cp_student_subject_marks MODIFY COLUMN grade VARCHAR(10) NULL DEFAULT ''`,

  // === M2M tables ===
  `ALTER TABLE tbl_cp_m2m_student_certification MODIFY COLUMN issue_date DATE NULL DEFAULT '1900-01-01'`,
  `ALTER TABLE tbl_cp_m2m_student_certification MODIFY COLUMN expiry_date DATE NULL`,
  `ALTER TABLE tbl_cp_m2m_student_certification MODIFY COLUMN certificate_url VARCHAR(500) NULL`,
];

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'campus5',
  });

  let ok = 0, skipped = 0, failed = 0;
  for (const sql of NULLABLE_FIXES) {
    const col = sql.match(/MODIFY COLUMN (\w+)/)?.[1] || '?';
    const tbl = sql.match(/ALTER TABLE (\w+)/)?.[1] || '?';
    try {
      await pool.query(sql);
      const logger = require('./utils/logger');
      logger.info(`✅ ${tbl}.${col}`);
      ok++;
    } catch(e) {
      const logger = require('./utils/logger');
      if (e.code === 'ER_BAD_FIELD_ERROR') {
        logger.warn(`⚠️  ${tbl}.${col} - column doesn't exist (skip)`);
        skipped++;
      } else {
        logger.error(`❌ ${tbl}.${col} - ${e.message}`);
        failed++;
      }
    }
  }

  const logger = require('./utils/logger');
  logger.info(`\n=== Done: ${ok} OK, ${skipped} skipped, ${failed} failed ===`);
  await pool.end();
}
main().catch(e => { const logger = require('./utils/logger'); logger.error(e.message); process.exit(1); });
