require('dotenv').config();
const { pool } = require('./config/db');

async function checkUsers() {
  try {
    const [rows] = await pool.execute('SELECT id, email, is_registration_complete, registration_step FROM users ORDER BY created_at DESC LIMIT 5;');
    console.log("Recent Auth Users:\n", rows);
    
    // Let's also check if tbl_cp_student exists
    const [students] = await pool.execute('SELECT student_id, first_name FROM tbl_cp_student ORDER BY student_id DESC LIMIT 5');
    console.log("Recent Profile Users:\n", students);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkUsers();
