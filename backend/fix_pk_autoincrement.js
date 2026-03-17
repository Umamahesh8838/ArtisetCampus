require('dotenv').config();
const mysql = require('mysql2/promise');

// This script finds the PK of each table and ensures it has AUTO_INCREMENT.
// It reads the full DDL first to determine the correct column type.
async function main() {
  const p = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const tables = [
    'tbl_cp_student_address',
    'tbl_cp_student_school',
    'tbl_cp_student_education',
    'tbl_cp_student_workexp',
    'tbl_cp_studentprojects',
    'tbl_cp_student_subject_marks',
  ];

  const logger = require('./utils/logger');
  for (const t of tables) {
    const [cols] = await p.query(`DESCRIBE ${t}`);
    const pk = cols.find(c => c.Key === 'PRI');
    if (!pk) { logger.warn(`${t}: no PK found`); continue; }
    const hasAutoInc = pk.Extra && pk.Extra.includes('auto_increment');
    if (hasAutoInc) { logger.info(`${t}.${pk.Field}: already AUTO_INCREMENT`); continue; }

    logger.info(`${t}: PK=${pk.Field} type=${pk.Type} — adding AUTO_INCREMENT...`);
    try {
      await p.query(`ALTER TABLE ${t} MODIFY COLUMN ${pk.Field} ${pk.Type} NOT NULL AUTO_INCREMENT`);
      logger.info(`  ✅ Fixed`);
    } catch(e) {
      logger.error(`  ❌ ${e.message}`);
      // Some tables may require dropping FK first — try alternative
      try {
        await p.query(`ALTER TABLE ${t} MODIFY COLUMN ${pk.Field} ${pk.Type} AUTO_INCREMENT`);
        logger.info(`  ✅ Fixed (without NOT NULL)`);
      } catch(e2) {
        logger.error(`  ❌ Still failed: ${e2.message}`);
      }
    }
  }

  // Also make sure all non-PK NOT NULL columns have defaults
  // Special fix: tbl_cp_mstates has state_code NOT NULL
  const extraFixes = [
    `ALTER TABLE tbl_cp_mstates MODIFY COLUMN state_code VARCHAR(10) NULL DEFAULT NULL`,
    `ALTER TABLE tbl_cp_mcountries MODIFY COLUMN country_code VARCHAR(10) NULL DEFAULT NULL`,
  ];
  for (const sql of extraFixes) {
    try {
      await p.query(sql);
      logger.info('✅', sql.substring(0, 80));
    } catch(e) {
      logger.error('❌', sql.substring(0, 80), '-', e.message.substring(0, 80));
    }
  }

  await p.end();
}
main().catch(e => { const logger = require('./utils/logger'); logger.error(e.message); process.exit(1); });
