require('dotenv').config();
const { pool } = require('./config/db');

async function testDraft() {
  try {
    const [users] = await pool.execute('SELECT id, registration_draft FROM users ORDER BY id DESC LIMIT 1');
    const user = users[0];
    console.log(`User ID: ${user.id}`);
    
    let draft = user.registration_draft;
    if (typeof draft === 'string') draft = JSON.parse(draft);
    
    // Check missing fields in basic
    console.log("Basic Profile:");
    console.log(draft.basic);
    
    console.log("School Education:");
    console.log(draft.school);
    
    console.log("College Education:");
    console.log(draft.college);
    
    console.log("Work Experience:");
    console.log(draft.workExperience);

    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
testDraft();
