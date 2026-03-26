require('dotenv').config();
const { pool } = require('./config/db');
const { processRegistration } = require('./controllers/registrationService');
const { normalizeDraft } = require('./utils/validation');

async function runTest() {
  let connection;
  try {
    // 1. Get the latest user who has a registration draft
    const [rows] = await pool.execute('SELECT id, registration_draft FROM users WHERE registration_draft IS NOT NULL ORDER BY id DESC LIMIT 1');
    if (!rows.length) return console.log('No drafts found');
    const user = rows[0];
    const rawDraft = typeof user.registration_draft === 'string' ? JSON.parse(user.registration_draft) : user.registration_draft;
    
    // 2. Normalize it just like authController does
    const draft = normalizeDraft(rawDraft);

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 3. Process
    console.log(`Testing submission for user ${user.id}...`);
    await processRegistration(connection, user.id, draft);
    
    // Actually rollback so we don't mess up their db state if it somehow passes
    await connection.rollback();
    console.log('SUCCESS: No SQL constraints failed! (Rolled back successfully)');

  } catch (err) {
    if (connection) await connection.rollback();
    console.error('CRASH DETECTED:');
    if (err && err.code) {
      console.error('  → MySQL Error Code:', err.code);
      console.error('  → SQL Message:', err.sqlMessage || err.message);
      console.error('  → SQL:', err.sql ? err.sql.substring(0, 200) : 'N/A');
    } else {
      console.error(err);
    }
  } finally {
    if (connection) connection.release();
    pool.end();
  }
}
runTest();
