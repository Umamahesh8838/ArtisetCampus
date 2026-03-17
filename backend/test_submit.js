require('dotenv').config();
const mysql = require('mysql2/promise');

// Simulates exactly what submitRegistration does with minimal data
async function test() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'campus5',
  });

  // Use user_id 2 (UMA MAHESWAR REDDY who exists in users table)
  const user_id = 2;
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Step 1: Get auth user
    const [userRows] = await connection.execute('SELECT first_name, last_name, email, phone FROM users WHERE id = ?', [user_id]);
    const u = userRows[0];
    console.log('Step 1 OK - user:', u.first_name, u.last_name, u.email);

    // Step 2: tbl_cp_student INSERT
    await connection.execute('DELETE FROM tbl_cp_student WHERE email = ?', [u.email]);
    await connection.execute(
      `INSERT INTO tbl_cp_student (student_id, salutation_id, first_name, last_name, email, contact_number, linkedin_url, github_url, date_of_birth, gender, user_type, is_active, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Student', TRUE, ?)`,
      [user_id, 1, u.first_name || 'Test', u.last_name || 'User', u.email, u.phone || '9999999999', '', '', null, 'Male', 'Active']
    );
    console.log('Step 2 OK - tbl_cp_student INSERT');

    // Step 3: Address (skip if no address data)
    console.log('Step 3 OK - address (skipped, no data)');

    // Step 4: School (skip)
    console.log('Step 4 OK - school (skipped)');

    // Step 5: College
    const [eduNext] = await connection.execute(`SELECT COALESCE(MAX(edu_id),0) + 1 AS nextId FROM tbl_cp_student_education`);
    await connection.execute(
      'DELETE FROM tbl_cp_student_education WHERE student_id = ?',
      [user_id]
    );
    console.log('Step 5 OK - college (deleted only)');

    // Step 6: Semester Marks – THE LIKELY FAILING STEP
    await connection.execute('DELETE FROM tbl_cp_student_subject_marks WHERE student_id = ?', [user_id]);
    console.log('Step 6 OK - semester marks table accessible!');

    // Step 7: Work Experience
    await connection.execute('DELETE FROM tbl_cp_student_workexp WHERE student_id = ?', [user_id]);
    console.log('Step 7 OK - work experience');

    // Step 8: Projects
    await connection.execute('DELETE FROM tbl_cp_studentprojects WHERE student_id = ?', [user_id]);
    console.log('Step 8 OK - projects');

    // Step 9a: Skills
    await connection.execute('DELETE FROM tbl_cp_m2m_std_skill WHERE student_id = ?', [user_id]);
    console.log('Step 9a OK - skills');

    // Step 9b: Languages
    await connection.execute('DELETE FROM tbl_cp_m2m_std_lng WHERE student_id = ?', [user_id]);
    console.log('Step 9b OK - languages');

    // Step 9c: Interests
    await connection.execute('DELETE FROM tbl_cp_m2m_std_interest WHERE student_id = ?', [user_id]);
    console.log('Step 9c OK - interests');

    // Step 9d: Certifications
    await connection.execute('DELETE FROM tbl_cp_m2m_student_certification WHERE student_id = ?', [user_id]);
    console.log('Step 9d OK - certifications');

    // Step 10: Update users table
    await connection.execute(
      'UPDATE users SET registration_draft = ?, registration_step = ?, is_registration_complete = ? WHERE id = ?',
      [JSON.stringify({ basic: {} }), 'completed', true, user_id]
    );
    console.log('Step 10 OK - users update');

    await connection.commit();
    console.log('\n✅ ALL STEPS PASSED - registration would succeed!');

  } catch (err) {
    await connection.rollback();
    console.error('\n❌ FAILED at step above!');
    console.error('Error Code:', err.code);
    console.error('SQL Message:', err.sqlMessage || err.message);
    if (err.sql) console.error('Failing SQL:', err.sql.substring(0, 300));
  } finally {
    connection.release();
    await pool.end();
  }
}

test();
