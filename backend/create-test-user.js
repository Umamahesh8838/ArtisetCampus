require('dotenv').config();
const bcrypt = require('bcrypt');
const { pool } = require('./config/db');

async function createTestUser() {
  try {
    const email = 'test@example.com';
    const phone = '9876543210';
    const password = 'password123';
    const first_name = 'Test';
    const last_name = 'User';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user exists
    const [existingUser] = await pool.execute(
      'SELECT id FROM users WHERE email = ? OR phone = ? LIMIT 1',
      [email, phone]
    );

    if (existingUser && existingUser.length > 0) {
      console.log('✅ User already exists with ID:', existingUser[0].id);
      return;
    }

    // Create user
    const [result] = await pool.execute(
      `INSERT INTO users (email, phone, first_name, last_name, password, is_email_verified, is_phone_verified, is_registration_complete, role, is_active) 
       VALUES (?, ?, ?, ?, ?, 1, 1, 0, 'student', 1)`,
      [email, phone, first_name, last_name, hashedPassword]
    );

    console.log('✅ Test user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Phone:', phone);
    console.log('User ID:', result.insertId);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    process.exit(1);
  }
}

createTestUser();
