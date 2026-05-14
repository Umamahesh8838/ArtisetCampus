require('dotenv').config();
const { pool } = require('../config/db');

(async () => {
  try {
    const [rows] = await pool.execute('SELECT question_id, question_text, question_type, is_active, created_at FROM tbl_cp_mquestions ORDER BY created_at DESC LIMIT 50');
    console.log('Questions found:', rows.length);
    rows.forEach(r => console.log(r.question_id, r.question_type, r.is_active, r.created_at, r.question_text && r.question_text.substring(0,60)));
  } catch (err) {
    console.error('Dump error:', err.message || err);
  } finally {
    process.exit(0);
  }
})();
