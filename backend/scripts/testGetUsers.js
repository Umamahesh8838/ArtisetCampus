require('dotenv').config();
const { pool } = require('../config/db');

(async () => {
  try {
    const role = undefined;
    const is_active = undefined;
    let query = `
      SELECT id, email, phone, role, is_active, created_at, updated_at
      FROM users
      WHERE 1=1
    `;
    const values = [];

    if (role) {
      query += ' AND role = ?';
      values.push(role);
    }

    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      values.push(is_active === 'true' || is_active == 1 ? 1 : 0);
    }

    query += ' ORDER BY created_at DESC LIMIT 20 OFFSET 0';

    console.log('Executing query:', query);

    const [users] = await pool.execute(query);
    console.log('User rows:', users.length);
  } catch (err) {
    console.error('TestGetUsers error:', err);
  } finally {
    process.exit(0);
  }
})();
