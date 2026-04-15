#!/usr/bin/env node

/**
 * Resume Upload Test WITH Authentication
 * 
 * Usage: node test-resume-auth.js
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BACKEND_URL = 'http://localhost:3000';
let authToken = null;

// Create a test resume file
function createTestResume() {
  const resumeContent = `Uma Maheswar Reddy
Email: umamahesh@gmail.com
Phone: 9876543210
LinkedIn: https://linkedin.com/in/umamahesh
GitHub: https://github.com/umamahesh

EDUCATION
B.Tech in Computer Science & Engineering
IIT Delhi | 2020 - 2024 | CGPA: 8.5

12th Grade - Delhi Public School - CBSE | 2020 | 95.5%

WORK EXPERIENCE
Software Engineering Intern at Google, Bangalore | May 2023 - July 2023

SKILLS
Python, Java, JavaScript, React, Node.js

LANGUAGES
English (Native), Hindi (Fluent)
`;
  return resumeContent;
}

// Get or create test user and get auth token
async function getAuthToken() {
  try {
    console.log("🔐 Getting authentication token...");
    
    // Try to register a test user
    const testUser = {
      email: 'test-resume-' + Date.now() + '@test.com',
      password: 'TestPassword123!',
      name: 'Test User'
    };

    console.log(`   Registering test user: ${testUser.email}`);
    
    try {
      // Try to register
      const registerRes = await axios.post(`${BACKEND_URL}/auth/register`, {
        email: testUser.email,
        password: testUser.password
      });
      console.log(`   ✓ User registered`);
    } catch (regError) {
      // User might already exist, that's fine
      if (regError.response?.status !== 409) {
        console.log(`   Note: Register response: ${regError.response?.status}`);
      }
    }

    // Login to get token
    const loginRes = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });

    authToken = loginRes.data.token;
    console.log(`   ✓ Login successful`);
    console.log(`   Token: ${authToken.substring(0, 20)}...\n`);

    return authToken;
  } catch (error) {
    console.error("❌ Failed to get auth token!");
    console.error("Error:", error.response?.data || error.message);
    process.exit(1);
  }
}

async function testResumeUpload() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║       RESUME UPLOAD TEST WITH AUTHENTICATION               ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  // Get auth token first
  await getAuthToken();

  // Check backend connection
  try {
    console.log("🔍 Checking backend connection...");
    await axios.get(`${BACKEND_URL}/health`).catch(() => {});
    console.log("✓ Backend is reachable\n");
  } catch (error) {
    console.error("❌ Cannot connect to backend");
    process.exit(1);
  }

  // Create test file
  console.log("📝 Creating test resume file...");
  const resumeContent = createTestResume();
  const testFilePath = path.join(__dirname, 'test-resume-auth.txt');
  
  fs.writeFileSync(testFilePath, resumeContent);
  console.log(`✓ Test file created\n`);

  // Prepare upload
  console.log("📤 Preparing multipart form data...");
  const form = new FormData();
  form.append('resume', fs.createReadStream(testFilePath));
  console.log("✓ FormData prepared\n");

  try {
    // Send upload request WITH AUTH TOKEN
    console.log("🚀 Sending POST /resume/parse-preview...");
    console.log(`URL: ${BACKEND_URL}/resume/parse-preview\n`);

    const startTime = Date.now();
    const response = await axios.post(
      `${BACKEND_URL}/resume/parse-preview`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${authToken}`  // Add auth header
        },
        timeout: 120000
      }
    );
    const duration = Date.now() - startTime;

    console.log(`✅ Success! (${duration}ms)\n`);

    // Analyze response - DETAILED ANALYSIS
    console.log("═".repeat(60));
    console.log("📊 DETAILED RESPONSE ANALYSIS");
    console.log("═".repeat(60));

    const { draft, resume_hash } = response.data;

    console.log(`\n✓ Response has 'draft': ${!!draft}`);
    console.log(`✓ Response has 'resume_hash': ${!!resume_hash}`);
    console.log(`✓ Resume hash: ${resume_hash}`);

    if (draft) {
      console.log("\n📦 DRAFT STRUCTURE:");
      console.log("─".repeat(60));

      // Check raw response for debugging
      console.log("\n🔍 RAW RESPONSE KEYS:", Object.keys(response.data));
      console.log("\n🔍 DRAFT KEYS:", Object.keys(draft));

      // Basic info detailed
      if (draft.basic) {
        console.log("\n👤 BASIC INFO DETAILS:");
        for (const [key, value] of Object.entries(draft.basic)) {
          const status = value ? '✓' : '✗';
          console.log(`   ${status} ${key}: ${value || '(empty)'}`);
        }
      } else {
        console.log("\n👤 BASIC INFO: No 'basic' object found");
      }

      // School education
      if (draft.schoolEducation?.length) {
        console.log(`\n🎒 SCHOOL EDUCATION (${draft.schoolEducation.length} entries):`);
        draft.schoolEducation.forEach((school, i) => {
          console.log(`   ┌─ [${i}]`);
          console.log(`   ├─ Standard: ${school.standard}`);
          console.log(`   ├─ School: ${school.schoolName}`);
          console.log(`   ├─ Board: ${school.board}`);
          console.log(`   ├─ Percentage: ${school.percentage}`);
          console.log(`   └─ Year: ${school.passingYear}`);
        });
      } else {
        console.log(`\n🎒 SCHOOL EDUCATION: ${draft.schoolEducation?.length || 0} entries`);
      }

      // College education
      if (draft.collegeEducation?.length) {
        console.log(`\n🎓 COLLEGE EDUCATION (${draft.collegeEducation.length} entries):`);
        draft.collegeEducation.forEach((college, i) => {
          console.log(`   ┌─ [${i}]`);
          console.log(`   ├─ College: ${college.collegeName}`);
          console.log(`   ├─ Course: ${college.courseName}`);
          console.log(`   ├─ Specialization: ${college.specializationName}`);
          console.log(`   ├─ CGPA: ${college.cgpa}`);
          console.log(`   ├─ Start: ${college.startYear}`);
          console.log(`   └─ End: ${college.endYear}`);
        });
      } else {
        console.log(`\n🎓 COLLEGE EDUCATION: ${draft.collegeEducation?.length || 0} entries`);
      }

      // Work experience
      if (draft.workExperience?.length) {
        console.log(`\n💼 WORK EXPERIENCE (${draft.workExperience.length} entries):`);
        draft.workExperience.forEach((work, i) => {
          console.log(`   ┌─ [${i}]`);
          console.log(`   ├─ Company: ${work.companyName}`);
          console.log(`   ├─ Role: ${work.designation}`);
          console.log(`   ├─ Location: ${work.location}`);
          console.log(`   ├─ Start: ${work.startDate}`);
          console.log(`   └─ End: ${work.endDate}`);
        });
      } else {
        console.log(`\n💼 WORK EXPERIENCE: ${draft.workExperience?.length || 0} entries`);
      }

      // Skills
      if (draft.skills?.length) {
        console.log(`\n💻 SKILLS (${draft.skills.length} entries):`);
        draft.skills.forEach((skill, i) => {
          console.log(`   [${i}] ${skill.skillName} (${skill.proficiencyLevel})`);
        });
      } else {
        console.log(`\n💻 SKILLS: ${draft.skills?.length || 0} entries`);
      }

      // Languages
      if (draft.languages?.length) {
        console.log(`\n🗣️  LANGUAGES (${draft.languages.length} entries):`);
        draft.languages.forEach((lang, i) => {
          console.log(`   [${i}] ${lang.languageName}`);
        });
      }

      // DATA COMPLETENESS
      const calculateStats = () => {
        let totalFields = 0;
        let filledFields = 0;

        // Count basic fields
        if (draft.basic) {
          const basicFilled = Object.values(draft.basic).filter(v => v).length;
          const basicTotal = Object.keys(draft.basic).length;
          totalFields += basicTotal;
          filledFields += basicFilled;
        }

        // Count arrays
        const arrayFields = ['schoolEducation', 'collegeEducation', 'workExperience', 'skills', 'languages'];
        let arrayCount = 0;
        arrayFields.forEach(field => {
          arrayCount += draft[field]?.length || 0;
        });

        return { filledFields, totalFields: Math.max(totalFields, 1), arrayCount };
      };

      const { filledFields, totalFields, arrayCount } = calculateStats();
      console.log("\n📈 STATISTICS:");
      console.log(`   Basic fields filled: ${filledFields}/${totalFields}`);
      console.log(`   Array entries found: ${arrayCount}`);
      console.log(`   Completeness: ${Math.round((filledFields / totalFields) * 100)}%`);
    }

    console.log("\n" + "═".repeat(60));
    console.log("✅ TEST COMPLETED SUCCESSFULLY");
    console.log("\n💡 NEXT STEPS:");
    console.log("   1. Check console logs in backend for [RESUME] and [MAPPER] prefixes");
    console.log("   2. If data is missing, look for 'Unknown field' warnings");
    console.log("   3. Review field name mismatches in console output");

  } catch (error) {
    console.error("\n❌ ERROR during upload!");
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error("Response:", JSON.stringify(error.response.data, null, 2));
    } else if (error.code === 'ECONNREFUSED') {
      console.error("Connection refused. Is the backend running?");
    } else {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }

    process.exit(1);
  } finally {
    // Cleanup
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  }
}

// Run test
testResumeUpload();
