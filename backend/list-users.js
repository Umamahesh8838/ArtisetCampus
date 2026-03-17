require('dotenv').config();
const { pool } = require('./config/db');

async function listUsers() {
  try {
    const [users] = await pool.execute(
      'SELECT id, email, phone, first_name, last_name, role, is_active, is_registration_complete, created_at FROM users ORDER BY id DESC LIMIT 20'
    );

    console.log('\n========== USERS IN DATABASE ==========\n');
    if (users.length === 0) {
      console.log('No users found');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Phone: ${user.phone}`);
        console.log(`   Name: ${user.first_name} ${user.last_name}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.is_active}`);
        console.log(`   Registration Complete: ${user.is_registration_complete}`);
        console.log(`   Created: ${user.created_at}`);
        console.log('');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listUsers();
