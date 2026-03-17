require('dotenv').config();
const bcrypt = require('bcrypt');
const { pool } = require('./config/db');

async function resetPassword() {
  try {
    const userId = 24; // test1@gmail.com
    const newPassword = 'test1234'; // New password

    // Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const [result] = await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    console.log('✅ Password updated for user ID 24');
    console.log('Email: test1@gmail.com');
    console.log('New Password: test1234');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetPassword();
