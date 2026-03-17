require('dotenv').config();
const { pool } = require('./config/db');
const { resolveCollegeId } = require('./utils/masterHelpers2');

async function run(){
  const conn = await pool.getConnection();
  try{
    await conn.beginTransaction();
    const id = await resolveCollegeId(conn, 'Test College');
    console.log('resolveCollegeId returned', id);
    const [rows] = await conn.execute('SELECT * FROM tbl_cp_mcolleges WHERE LOWER(college_name)=LOWER(?)', ['Test College']);
    console.log('tbl_cp_mcolleges rows:', rows);
    await conn.rollback();
  }catch(err){
    console.error(err);
    try{ await conn.rollback(); }catch(e){}
  }finally{ conn.release(); process.exit(0); }
}

run();
