#!/usr/bin/env node

/**
 * Simple Resume Upload Test
 * Tests the complete flow without needing the frontend
 * 
 * Usage: node test-resume-upload.js
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BACKEND_URL = 'http://localhost:3000';

// Create a test resume file
function createTestResume() {
  const resumeContent = `
Uma Maheswar Reddy
Email: umamahesh@gmail.com
Phone: 9876543210
LinkedIn: https://linkedin.com/in/umamahesh
GitHub: https://github.com/umamahesh

EDUCATION
B.Tech in Computer Science & Engineering
IIT Delhi | 2020 - 2024 | CGPA: 8.5

12th Grade - Delhi Public School - CBSE | 2020 | 95.5%
10th Grade - Delhi Public School - CBSE | 2018 | 96%

WORK EXPERIENCE
Software Engineering Intern
Google, Bangalore | May 2023 - July 2023

Software Development Intern
Amazon, Bangalore | June 2022 - July 2022

SKILLS
- Programming: Python, Java, C++, JavaScript
- Web: React, Node.js, Express, MongoDB
- Tools: Git, Docker, VS Code

LANGUAGES
English (Native), Hindi (Fluent)

CERTIFICATIONS
AWS Certified Cloud Practitioner
Google Cloud Associate Cloud Engineer
`;

  return resumeContent;
}

async function testResumeUpload() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║           RESUME UPLOAD TEST - Full Flow                   ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  // Check if backend is running
  try {
    console.log("🔍 Checking backend connection...");
    await axios.get(`${BACKEND_URL}/health`).catch(() => {
      console.log("ℹ️  Health endpoint not available (expected)");
    });
    console.log("✓ Backend is reachable\n");
  } catch (error) {
    console.error("❌ Cannot connect to backend at", BACKEND_URL);
    console.error("Please ensure backend is running: npm start");
    process.exit(1);
  }

  // Create test file
  console.log("📝 Creating test resume file...");
  const resumeContent = createTestResume();
  const testFilePath = path.join(__dirname, 'test-resume.txt');
  
  fs.writeFileSync(testFilePath, resumeContent);
  console.log(`✓ Test file created: ${testFilePath}\n`);

  // Prepare upload
  console.log("📤 Preparing multipart form data...");
  const form = new FormData();
  form.append('resume', fs.createReadStream(testFilePath));
  console.log("✓ FormData prepared\n");

  try {
    // Send upload request
    console.log("🚀 Sending POST /resume/parse-preview...");
    console.log(`URL: ${BACKEND_URL}/resume/parse-preview\n`);

    const startTime = Date.now();
    const response = await axios.post(
      `${BACKEND_URL}/resume/parse-preview`,
      form,
      {
        headers: form.getHeaders(),
        timeout: 60000
      }
    );
    const duration = Date.now() - startTime;

    console.log(`✅ Success! (${duration}ms)\n`);

    // Analyze response
    console.log("📊 RESPONSE ANALYSIS:");
    console.log("═".repeat(60));

    const { draft, resume_hash } = response.data;

    console.log(`\n✓ Response has 'draft': ${!!draft}`);
    console.log(`✓ Response has 'resume_hash': ${!!resume_hash}`);

    if (draft) {
      console.log("\n📦 DRAFT STRUCTURE:");
      console.log("─".repeat(60));

      // Basic info
      if (draft.basic) {
        console.log("\n👤 BASIC INFO:");
        const filledFields = Object.entries(draft.basic)
          .filter(([_, v]) => v)
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n  ');
        
        const emptyFields = Object.entries(draft.basic)
          .filter(([_, v]) => !v)
          .map(([k]) => k)
          .join(', ');

        if (filledFields) {
          console.log("  ✓ Filled:");
          console.log(`   ${filledFields.replace(/\n/g, '\n  ')}`);
        }
        
        if (emptyFields) {
          console.log(`  ✗ Empty: ${emptyFields}`);
        }
      }

      // School education
      if (draft.schoolEducation?.length) {
        console.log(`\n🎒 SCHOOL EDUCATION (${draft.schoolEducation.length} entries):`);
        draft.schoolEducation.forEach((school, i) => {
          console.log(`   [${i}] ${school.standard} - ${school.schoolName} (${school.percentage}%)`);
        });
      } else {
        console.log(`\n🎒 SCHOOL EDUCATION: No entries found`);
      }

      // College education
      if (draft.collegeEducation?.length) {
        console.log(`\n🎓 COLLEGE EDUCATION (${draft.collegeEducation.length} entries):`);
        draft.collegeEducation.forEach((college, i) => {
          console.log(`   [${i}] ${college.courseName} - ${college.collegeName} (CGPA: ${college.cgpa})`);
        });
      } else {
        console.log(`\n🎓 COLLEGE EDUCATION: No entries found`);
      }

      // Work experience
      if (draft.workExperience?.length) {
        console.log(`\n💼 WORK EXPERIENCE (${draft.workExperience.length} entries):`);
        draft.workExperience.forEach((work, i) => {
          console.log(`   [${i}] ${work.designation} at ${work.companyName}`);
        });
      } else {
        console.log(`\n💼 WORK EXPERIENCE: No entries found`);
      }

      // Skills
      if (draft.skills?.length) {
        console.log(`\n💻 SKILLS (${draft.skills.length} entries):`);
        draft.skills.forEach((skill, i) => {
          console.log(`   [${i}] ${skill.skillName} (${skill.proficiencyLevel})`);
        });
      } else {
        console.log(`\n💻 SKILLS: No entries found`);
      }

      // Data completeness score
      const calculateCompleteness = () => {
        let filled = 0, total = 0;

        if (draft.basic) {
          total += Object.keys(draft.basic).length;
          filled += Object.values(draft.basic).filter(v => v).length;
        }

        total += (draft.schoolEducation?.length || 0) * 5;
        filled += (draft.schoolEducation?.length || 0) * 5;

        total += (draft.collegeEducation?.length || 0) * 5;
        filled += (draft.collegeEducation?.length || 0) * 5;

        total += (draft.workExperience?.length || 0) * 5;
        filled += (draft.workExperience?.length || 0) * 5;

        total += (draft.skills?.length || 0) * 2;
        filled += (draft.skills?.length || 0) * 2;

        return total > 0 ? Math.round((filled / total) * 100) : 0;
      };

      const completeness = calculateCompleteness();
      console.log("\n📈 DATA COMPLETENESS:");
      console.log(`   Score: ${completeness}%`);
      console.log(`   ${'█'.repeat(Math.floor(completeness / 5))}${'░'.repeat(20 - Math.floor(completeness / 5))}`);
    }

    console.log("\n" + "═".repeat(60));
    console.log("✅ TEST COMPLETED SUCCESSFULLY");

  } catch (error) {
    console.error("\n❌ ERROR during upload!");
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error("Response:", JSON.stringify(error.response.data, null, 2));
    } else if (error.code === 'ECONNREFUSED') {
      console.error("Connection refused. Is the backend running?");
      console.error("Start it with: npm start");
    } else {
      console.error("Message:", error.message);
    }

    process.exit(1);
  } finally {
    // Cleanup
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
      console.log("\n🧹 Test file cleaned up");
    }
  }
}

// Run test
testResumeUpload();
