require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { pool } = require('./config/db');

async function testConnection() {
  try {
    // Check auth table
    const [users] = await pool.query('SELECT id, email, first_name, is_registration_complete, registration_step FROM users ORDER BY id DESC LIMIT 1');
    
    if (users.length === 0) {
      console.log('No users found in DB.');
      process.exit(0);
    }
    const user = users[0];
    console.log('--- RECENT AUTHENTICATION RECORD ---');
    console.log(`ID: ${user.id} | Email: ${user.email} | Registration Complete: ${Boolean(user.is_registration_complete)}`);
    console.log();

    // Check Profile Table
    const [students] = await pool.query('SELECT student_id, first_name, email, contact_number, date_of_birth FROM tbl_cp_student WHERE student_id = ?', [user.id]);
    if (students.length > 0) {
      console.log('--- RECENT STUDENT PROFILE (tbl_cp_student) ---');
      console.log(students[0]);
    } else {
        console.log(`NO PROFILE FOUND FOR STUDENT_ID ${user.id}`);
    }
    console.log();

    // Check Address
    const [addresses] = await pool.query('SELECT address_line_1, address_type FROM tbl_cp_student_address WHERE student_id = ?', [user.id]);
    if (addresses.length > 0) {
      console.log(`--- STUDENT ADDRESSES (${addresses.length}) ---`);
      console.log(addresses);
    }
    console.log();

    // Check Skills
    const [skills] = await pool.query('SELECT s.name as Skill FROM tbl_cp_m2m_std_skill m JOIN tbl_cp_mskills s ON m.skill_id = s.skill_id WHERE m.student_id = ?', [user.id]);
    if (skills.length > 0) {
      console.log(`--- STUDENT SKILLS (${skills.length}) ---`);
      console.log(skills);
    }

  } catch (err) {
    console.error('Error connecting to DB:', err);
  } finally {
    process.exit(0);
  }
}

testConnection();
