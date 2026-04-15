require('dotenv').config();
const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

async function createAdmin() {
  const email = 'admin@artiset.com';
  const phone = '9999999999';
  const password = 'admin123';
  const firstName = 'System';
  const lastName = 'Admin';

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if user exists
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    
    if (existing.length > 0) {
      console.log('Admin user already exists. Updating role to admin...');
      await pool.execute('UPDATE users SET role = "admin", is_active = 1, is_registration_complete = 1 WHERE email = ?', [email]);
    } else {
      console.log('Creating new admin user...');
      const [result] = await pool.execute(
        'INSERT INTO users (email, phone, password, first_name, last_name, role, is_active, is_registration_complete, is_email_verified, is_phone_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [email, phone, hashedPassword, firstName, lastName, 'admin', 1, 1, 1, 1]
      );
      console.log('Admin user created with ID:', result.insertId);
    }
    
    console.log('\n==========================================');
    console.log('ADMIN LOGIN DETAILS:');
    console.log('Email: ' + email);
    console.log('Password: ' + password);
    console.log('==========================================\n');
    
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err.message);
    process.exit(1);
  }
}

createAdmin();
