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
      const pk = cols.find(c => c.Key === 'PRI');
      const autoInc = cols.find(c => c.Extra && c.Extra.includes('auto_increment'));
      logger.info(`\n${t}:`);
      logger.info(`  PK: ${pk ? pk.Field + ' (' + pk.Type + ')' : 'NONE'}`);
      logger.info(`  AUTO_INCREMENT: ${autoInc ? autoInc.Field : 'NONE ⚠️'}`);
      cols.filter(c => c.Null === 'NO' && !c.Extra.includes('auto_increment') && !c.Default).forEach(c => {
        logger.warn(`  NOT NULL no default: ${c.Field} (${c.Type})`);
      });
    } catch(e) {
      logger.error(`\n${t}: ❌ ${e.message}`);
    }
  }

  await pool.end();
}
main().catch(e => { const logger = require('./utils/logger'); logger.error(e.message); process.exit(1); });
