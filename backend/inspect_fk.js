require('dotenv').config();
const { pool } = require('./config/db');

async function run(){
  const conn = await pool.getConnection();
  const logger = require('./utils/logger');
  try{
    const [rows] = await conn.execute(`SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tbl_cp_student_education'`, [process.env.DB_NAME || 'campus5']);
    logger.info(rows);
  }catch(err){ logger.error(err); }
  finally{ process.exit(0); }
}
run();
