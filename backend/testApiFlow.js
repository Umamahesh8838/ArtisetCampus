require('dotenv').config();
const { pool } = require('./config/db');
const { buildDraftFromDb } = require('./utils/draftExtractor');

async function testSignupAndDraft() {
  const email = 'testuser_' + Date.now() + '@example.com';
  const phone = '99999' + Math.floor(Math.random() * 90000 + 10000);
  
  try {
    const conn = await pool.getConnection();
    
    // 1. Simulate Signup
    const initialDraft = JSON.stringify({
      basic: {
        firstName: 'Test',
        lastName: 'User',
        email: email,
        contactNumber: phone
      }
    });

    const insertAuthSql = 'INSERT INTO users (email, phone, password, first_name, last_name, is_email_verified, is_phone_verified, registration_draft) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const [authResult] = await conn.execute(insertAuthSql, [email, phone, 'hashedPassword', 'Test', 'User', 1, 1, initialDraft]);
    const userId = authResult.insertId;
    console.log(`[1] Created User ID: ${userId}`);

    const insertProfileSql = `INSERT INTO tbl_cp_student (student_id, first_name, last_name, email, contact_number) VALUES (?, ?, ?, ?, ?)`;
    await conn.execute(insertProfileSql, [userId, 'Test', 'User', email, phone]);
    console.log(`[2] Created tbl_cp_student record`);

    // 2. Simulate GET /auth/registration/draft
    const [rows] = await conn.execute('SELECT registration_draft FROM users WHERE id = ?', [userId]);
    let draft = rows[0].registration_draft;
    
    console.log(`[3] Raw draft from DB string type?`, typeof draft);
    console.log(`Raw draft value:`, draft);

    if (!draft || (typeof draft === 'object' && Object.keys(draft).length === 0) || (typeof draft === 'string' && (draft === '{}' || draft === '""'))) {
        console.log(`[4] FALLBACK: buildDraftFromDb triggered!`);
        const extractedDraft = await buildDraftFromDb(userId);
        console.log("Extracted Draft:", JSON.stringify(extractedDraft, null, 2));
    } else {
        console.log(`[4] NO FALLBACK. Returning raw draft.`);
    }

    conn.release();
    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testSignupAndDraft();
