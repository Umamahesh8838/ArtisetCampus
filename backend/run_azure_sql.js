require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const fs = require('fs');
const { pool } = require('./config/db');
const logger = require('./utils/logger');
 
async function runAzureSQL() {
  try {
    const rawSql = fs.readFileSync(require('path').resolve(__dirname, 'auth_schema_azure.sql'), 'utf-8');
    
    // Quick parse to ignore comments and split by ;
    const statements = rawSql
      .split(';')
      .map(s => s.trim().replace(/^--.*$/gm, '').trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      logger.info('Executing:', stmt.substring(0, 50) + '...');
      await pool.query(stmt);
      logger.info('Done.');
    }
    
    logger.info('\nSuccessfully executed all DDL schemas into campus5!');
  } catch (err) {
    logger.error('Error executing SQL:', err);
  } finally {
    process.exit(0);
  }
}

runAzureSQL();
