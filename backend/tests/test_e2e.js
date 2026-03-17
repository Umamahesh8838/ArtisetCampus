require('dotenv').config();
const { pool } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_secret';

async function sleep(ms){ return new Promise(res=>setTimeout(res, ms)); }

async function run() {
  const conn = await pool.getConnection();
  let userId = null;
  try {
    // 1) Create test user
    const email = `e2e_test_${Date.now()}@example.com`;
    const phone = `9999${Math.floor(Math.random()*900000+100000)}`;
    const pwd = await bcrypt.hash('Password123!', 10);
    const [ins] = await conn.execute(
      'INSERT INTO users (email, phone, password, first_name, last_name, is_email_verified, is_phone_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [email, phone, pwd, 'E2E', 'User', 1, 1]
    );
    userId = ins.insertId;
    logger.info('Created test user id=', userId, email, phone);

    // 2) Create JWT
    const token = jwt.sign({ user_id: userId, email, phone }, JWT_SECRET, { expiresIn: '1h' });

    // 3) Wait for server to be ready (try connecting)
    // Use IPv6 loopback explicitly to avoid Windows localhost resolution issues
    const host = process.env.TEST_HOST || '[::1]';
    const url = `http://${host}:${process.env.PORT || 3000}/auth/registration/submit`;
    let ok = false;
    for (let i=0;i<10;i++){
      try {
        const r = await fetch(`http://${host}:${process.env.PORT || 3000}/auth/me`, { method: 'GET', headers: { Authorization: 'Bearer ' + token } });
        if (r.status === 200 || r.status === 401 || r.status === 403) { ok = true; break; }
      } catch(e){ }
      await sleep(500);
    }
    if (!ok) throw new Error('Server not responding on port ' + (process.env.PORT || 3000));

    // 4) Prepare a realistic draft payload with geography info
    const draft = {
      basic: { firstName: 'E2E', lastName: 'User', gender: 'Male', contactNumber: phone },
      address: {
        current: { line1: '123 Test St', line2: '', landmark: 'Near park', city: 'TestCity', state: 'TestState', country: 'TestCountry', pincode: '560001', area_name: 'Test Area' }
      },
      college: { college: 'Test College', course: 'B.Tech', startYear: 2015, endYear: 2019, cgpa: 8.0 }
    };

    // 5) POST the registration submit
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ draft })
    });
    const data = await res.text();
    logger.info('Registration submit response status=', res.status);
    logger.info('Response body:', data);

    // 6) Print DB rows we created (student profile)
    const [stuRows] = await conn.execute('SELECT * FROM tbl_cp_student WHERE student_id = ?', [userId]);
    logger.info('tbl_cp_student rows for user:', stuRows.length);

    // 7) Cleanup: delete from many tables (best-effort)
    const tables = [
      'tbl_cp_student_address','tbl_cp_student_school','tbl_cp_student_education','tbl_cp_student_subject_marks',
      'tbl_cp_student_workexp','tbl_cp_studentprojects','tbl_cp_m2m_std_skill','tbl_cp_m2m_std_lng',
      'tbl_cp_m2m_std_interest','tbl_cp_m2m_student_certification','tbl_cp_student'
    ];
    for (const t of tables) {
      try { await conn.execute(`DELETE FROM ${t} WHERE student_id = ?`, [userId]); } catch(e){}
    }
    await conn.execute('DELETE FROM otp_requests WHERE identifier = ? OR identifier = ?', [email, phone]);
    await conn.execute('DELETE FROM users WHERE id = ?', [userId]);
    logger.info('Cleaned up test records for user', userId);

  } catch (err) {
    logger.error('test_e2e error:', err);
    if (userId) {
      try {
        await conn.execute('DELETE FROM tbl_cp_student_address WHERE student_id = ?', [userId]);
        await conn.execute('DELETE FROM tbl_cp_student WHERE student_id = ?', [userId]);
        await conn.execute('DELETE FROM users WHERE id = ?', [userId]);
      } catch(e) {}
    }
  } finally {
    if (conn) conn.release();
    process.exit(0);
  }
}

run();
