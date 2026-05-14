require('dotenv').config();
const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

async function seed() {
  const email = process.env.ADMIN_EMAIL || 'admin@artiset.com';
  const phone = process.env.ADMIN_PHONE || '9999999999';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  const password_hash = await bcrypt.hash(password, 10);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (rows && rows.length > 0) {
      const id = rows[0].id;
      await conn.execute(
        'UPDATE users SET password = ?, role = ?, is_email_verified = 1, is_phone_verified = 1, is_active = 1, is_registration_complete = 1, updated_at = NOW() WHERE id = ?',
        [password_hash, 'admin', id]
      );
      console.log('Updated existing admin user id', id);
    } else {
      const [res] = await conn.execute(
        `INSERT INTO users (email, phone, password, first_name, last_name, role, is_email_verified, is_phone_verified, is_active, is_registration_complete, registration_step, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'admin', 1, 1, 1, 1, 'completed', NOW(), NOW())`,
        [email, phone, password_hash, 'Admin', 'User']
      );
      console.log('Inserted admin user id', res.insertId);
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    console.error('Failed to seed admin:', err.message || err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

seed();
