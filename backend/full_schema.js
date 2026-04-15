require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'campus5',
  });

  const tables = [
    'tbl_cp_mcountries',
    'tbl_cp_mstates', 
    'tbl_cp_mcities',
    'tbl_cp_mpincodes',
    'tbl_cp_mcolleges',
    'tbl_cp_mcourses',
    'tbl_cp_minterests',
    'tbl_cp_mskills',
    'tbl_cp_mlanguages',
    'tbl_cp_mcertifications',
  ];

  const logger = require('./utils/logger');
  for (const t of tables) {
    try {
      const [cols] = await pool.query(`DESCRIBE ${t}`);
      logger.info(`\n=== ${t} ===`);
      cols.forEach(c => logger.info(`  ${c.Field} | ${c.Type} | Null:${c.Null} | Key:${c.Key} | Default:${c.Default} | Extra:${c.Extra}`));
    } catch(e) {
      logger.error(`${t}: ❌ ${e.message}`);
    }
  }

  await pool.end();
}
main().catch(e => { const logger = require('./utils/logger'); logger.error(e.message); process.exit(1); });
