require('dotenv').config();
const mysql = require('mysql2/promise');

// Get ALL tables in the database and find every NOT NULL column with no default.
// Then auto-fix each one.
async function main() {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  // Get all tables in the database
  const [tables] = await pool.query(`SHOW TABLES`);
  const tableNames = tables.map(t => Object.values(t)[0]);
  
  const logger = require('./utils/logger');
  logger.info(`Found ${tableNames.length} tables. Scanning for NOT NULL columns with no default...\n`);

  let totalFixed = 0;
  let totalErrors = 0;

  for (const tableName of tableNames) {
    // Skip non-cp tables
    if (!tableName.startsWith('tbl_cp_') && tableName !== 'users') continue;
    
    const [cols] = await pool.query(`DESCRIBE ${tableName}`);
    
    for (const col of cols) {
      // Skip: auto_increment, has default, or is nullable
      if (col.Extra && col.Extra.includes('auto_increment')) continue;
      if (col.Null === 'YES') continue;
      if (col.Default !== null) continue;
      if (col.Key === 'PRI') continue; // skip PK without auto_increment (they're intentional)
      
      // This column is NOT NULL, no default, not auto_increment — it'll fail INSERT
      const colType = col.Type;
      let fixSql;
      
      // Choose appropriate default based on type
      if (colType.startsWith('int') || colType.startsWith('tinyint') || colType.startsWith('smallint') || colType.startsWith('bigint')) {
        fixSql = `ALTER TABLE ${tableName} MODIFY COLUMN ${col.Field} ${colType} NULL DEFAULT NULL`;
      } else if (colType.startsWith('float') || colType.startsWith('double') || colType.startsWith('decimal')) {
        fixSql = `ALTER TABLE ${tableName} MODIFY COLUMN ${col.Field} ${colType} NULL DEFAULT NULL`;
      } else if (colType.startsWith('varchar') || colType.startsWith('char') || colType.startsWith('text') || colType.startsWith('longtext')) {
        fixSql = `ALTER TABLE ${tableName} MODIFY COLUMN ${col.Field} ${colType} NULL DEFAULT NULL`;
      } else if (colType === 'date' || colType === 'datetime' || colType.startsWith('timestamp')) {
        fixSql = `ALTER TABLE ${tableName} MODIFY COLUMN ${col.Field} ${colType} NULL DEFAULT NULL`;
      } else if (colType.startsWith('tinyint(1)') || colType === 'boolean') {
        fixSql = `ALTER TABLE ${tableName} MODIFY COLUMN ${col.Field} ${colType} NULL DEFAULT NULL`;
      } else if (colType.startsWith('enum')) {
        fixSql = `ALTER TABLE ${tableName} MODIFY COLUMN ${col.Field} ${colType} NULL DEFAULT NULL`;
      } else {
        fixSql = `ALTER TABLE ${tableName} MODIFY COLUMN ${col.Field} ${colType} NULL DEFAULT NULL`;
      }
      
      try {
        await pool.query(fixSql);
        logger.info(`✅ ${tableName}.${col.Field} (${colType}) → nullable`);
        totalFixed++;
      } catch(e) {
        logger.error(`❌ ${tableName}.${col.Field}: ${e.message.substring(0, 100)}`);
        totalErrors++;
      }
    }
  }
  logger.info(`\n=== DONE: ${totalFixed} fixed, ${totalErrors} errors ===`);
  await pool.end();
}
main().catch(e => { const logger = require('./utils/logger'); logger.error(e.message); process.exit(1); });
