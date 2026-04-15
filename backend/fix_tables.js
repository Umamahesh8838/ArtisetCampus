require('dotenv').config();
const { pool } = require('./config/db');
const logger = require('./utils/logger');

async function fixTables() {
  try {
    logger.info('Starting DB Table Fix...');

    // Drop old versions if they exist and mismatch
    const tablesToDrop = [
      'tbl_cp_application_status_history',
      'tbl_cp_application',
      'tbl_cp_job_description',
      'tbl_cp_m2m_student_exam_session',
      'tbl_cp_m2m_student_interview_session',
      'tbl_cp_exam_result',
      'tbl_cp_interview_evaluation',
      'tbl_cp_round_result',
      'tbl_cp_offers',
      'tbl_cp_placements',
      'tbl_cp_m2m_question_options',
      'tbl_cp_mquestions',
      'tbl_cp_msubjects',
      'tbl_cp_exam_session',
      'tbl_cp_interview_session',
      'tbl_cp_recruitment_drive',
      'tbl_cp_mcompany',
      'tbl_cp_notifications',
      'tbl_cp_audit_log'
    ];

    logger.info('Disabling foreign key checks...');
    await pool.execute('SET FOREIGN_KEY_CHECKS = 0');

    for (const table of tablesToDrop) {
      logger.info(`Dropping table ${table}...`);
      await pool.execute(`DROP TABLE IF EXISTS ${table}`);
    }

    logger.info('Re-enabling foreign key checks...');
    await pool.execute('SET FOREIGN_KEY_CHECKS = 1');

    logger.info('Recreating tables with correct schema...');
    
    // Re-run the migration logic from db.js
    const { runMigration002 } = require('./config/db');
    await runMigration002();

    logger.info('DB Tables fixed successfully!');
    process.exit(0);
  } catch (err) {
    logger.error('Fix tables error:', err);
    process.exit(1);
  }
}

fixTables();
