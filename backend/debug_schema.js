require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'campus5',
  });

  try {
    const [tables] = await pool.query("SHOW TABLES LIKE 'tbl_cp_%'");
    console.log('\n=== Tables matching tbl_cp_* ===');
    if (tables.length === 0) {
      console.log('  (none found - your relational tables may not be in campus5!)');
    } else {
      tables.forEach(t => console.log(' -', Object.values(t)[0]));
    }

    // Check specifically for semester marks table
    const [smCheck] = await pool.query("SHOW TABLES LIKE 'tbl_cp_student_subject_marks'");
    if (smCheck.length === 0) {
      console.log('\n❌ tbl_cp_student_subject_marks does NOT exist!');
    } else {
      console.log('\n✅ tbl_cp_student_subject_marks exists');
      const [cols] = await pool.query('DESCRIBE tbl_cp_student_subject_marks');
      console.log('   Columns:', cols.map(c => `${c.Field}(${c.Null === 'NO' ? 'NOT NULL' : 'NULL'})`).join(', '));
    }

    // Check tbl_cp_student columns (NOT NULL constraint is the most common issue)
    try {
      const [studentCols] = await pool.query('DESCRIBE tbl_cp_student');
      console.log('\n=== tbl_cp_student columns ===');
      studentCols.forEach(c => console.log(' -', c.Field, c.Null === 'NO' ? '[NOT NULL]' : '[NULL ok]', c.Default != null ? `default=${c.Default}` : ''));
    } catch(e) {
      console.log('\n❌ tbl_cp_student does not exist either!');
    }

    // Recent users
    const [users] = await pool.query('SELECT id, first_name, last_name, email FROM users ORDER BY id DESC LIMIT 3');
    console.log('\n=== Recent users ===');
    users.forEach(u => console.log(' -', u.id, u.first_name, u.last_name, u.email));

  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
}
main();
