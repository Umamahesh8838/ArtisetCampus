/**
 * Fix authController-new.js - Replace all tbl_cp_user references with 'users'
 * and user_id with id, and password_hash with password
 * 
 * This script helps identify all the places that need fixing
 */

const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../controllers/authController-new.js');
let content = fs.readFileSync(file, 'utf8');

// Count replacements
let count = 0;

// Replace tbl_cp_user with users
content = content.replace(/tbl_cp_user/g, () => { count++; return 'users'; });

// Replace password_hash column references
content = content.replace(/password_hash/g, () => { count++; return 'password'; });

// Replace user_id with id (but be careful about comments)
content = content.replace(/user_id/g, () => { count++; return 'id'; });

fs.writeFileSync(file, content);
console.log(`✅ Fixed ${count} references in authController-new.js`);
console.log('Changes:');
console.log('  - tbl_cp_user → users');
console.log('  - user_id → id');
console.log('  - password_hash → password');
