require('dotenv').config();
const jwt = require('jsonwebtoken');

async function testUpload() {
  console.log("--- Starting Azure Blob Upload Test ---");
  
  if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
    console.error("Missing AZURE_STORAGE_CONNECTION_STRING in .env");
    return;
  }
  
  // 1. Generate a valid token
  const secret = process.env.JWT_SECRET || 'replace_this_secret';
  const token = jwt.sign(
    { id: 1, user_id: 1, email: 'test@example.com', role: 'student' },
    secret
  );
  
  console.log("1. Generated test auth token");

  // 2. Prepare a fake image file for the Profile Pic endpoint
  const profileForm = new FormData();
  const imgBlob = new Blob(["fake image bytes"], { type: 'image/jpeg' });
  profileForm.append('file', imgBlob, 'fake_profile.jpg');
  
  console.log("2. Testing POST /upload/profile-pic ...");
  try {
    const resPic = await fetch('http://localhost:3000/upload/profile-pic', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: profileForm
    });
    
    const dataPic = await resPic.json();
    console.log(`-> Profile Pic Response (${resPic.status}):`, dataPic);
  } catch (e) {
    console.error("Failed to hit profile-pic endpoint:", e.message);
  }

  // 3. Prepare a fake PDF file for the Resume endpoint
  const resumeForm = new FormData();
  const pdfBlob = new Blob(["fake pdf bytes"], { type: 'application/pdf' });
  resumeForm.append('file', pdfBlob, 'fake_resume.pdf');
  
  console.log("\n3. Testing POST /upload/resume ...");
  try {
    const resResume = await fetch('http://localhost:3000/upload/resume', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: resumeForm
    });
    
    const dataResume = await resResume.json();
    console.log(`-> Resume Response (${resResume.status}):`, dataResume);
  } catch (e) {
    console.error("Failed to hit resume endpoint:", e.message);
  }
  console.log("--- Test Complete ---");
}

testUpload();
