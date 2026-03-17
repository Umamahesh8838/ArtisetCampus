require('dotenv').config();
const { pool } = require('./config/db');
const { resolveCollegeId, resolveCourseId, getNextId } = require('./utils/masterHelpers2');

async function run(){
  const conn = await pool.getConnection();
  let userId = null;
  try{
    await conn.beginTransaction();
    // create user
    const [u] = await conn.execute('INSERT INTO users (email, phone, first_name, last_name, is_email_verified, is_phone_verified) VALUES (?, ?, ?, ?, ?, ?)', [`edu_test_${Date.now()}@ex.com`, '9999000000', 'Edu', 'Test', 1, 1]);
    userId = u.insertId;
    // create student profile
    await conn.execute('INSERT INTO tbl_cp_student (student_id, first_name, last_name, email, contact_number) VALUES (?, ?, ?, ?, ?)', [userId, 'Edu', 'Test', `edu_test_${Date.now()}@ex.com`, '9999000000']);

    const colId = await resolveCollegeId(conn, 'Test College');
    const corId = await resolveCourseId(conn, 'B.Tech');
    console.log('colId, corId =', colId, corId);
    const eduId = await getNextId(conn, 'tbl_cp_student_education', 'edu_id');
    await conn.execute('INSERT INTO tbl_cp_student_education (edu_id, student_id, college_id, course_id, start_year, end_year, cgpa, percentage) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [eduId, userId, colId, corId, 2015, 2019, 8.0, 80]);
    console.log('Inserted education successfully');
    await conn.rollback();
  }catch(err){
    console.error('test_edu_insert error:', err);
    try{ await conn.rollback(); }catch(e){}
  }finally{ if(conn) conn.release(); process.exit(0); }
}

run();
