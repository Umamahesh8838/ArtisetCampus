/**
 * Debug script to understand exact parser response structure
 * This will help us fix the mapping function
 */

require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Simulated resume parser response based on Ollama output
// This is what we EXPECT to see from the Azure parser API

const SAMPLE_PARSER_RESPONSES = {
  // Response 1: Direct parsing format
  directFormat: {
    basic: {
      first_name: 'Uma',
      last_name: 'Maheswar',
      email: 'umamahesh@gmail.com',
      phone: '9876543210',
      linkedin_url: 'https://linkedin.com/in/uma',
      github_url: 'https://github.com/uma'
    },
    education: [
      {
        institution_name: 'IIT Delhi',
        degree: 'B.Tech',
        major: 'Computer Science',
        start_year: 2020,
        end_year: 2024,
        gpa: 8.5
      }
    ],
    school: [
      {
        standard: 'XII',
        school_name: 'DPS School',
        board: 'CBSE',
        percentage: 95,
        passing_year: 2020
      }
    ],
    work_experience: [
      {
        company_name: 'Google',
        job_title: 'SDE Intern',
        location: 'Bangalore',
        employment_type: 'Internship',
        start_date: '2023-05',
        end_date: '2023-07'
      }
    ],
    skills: [
      { name: 'Python', complexity: 'Expert' },
      { name: 'JavaScript', complexity: 'Advanced' }
    ]
  },

  // Response 2: Wrapped in data.parsed
  wrappedFormat: {
    success: true,
    data: {
      parsed: {
        firstName: 'Uma',
        lastName: 'Maheswar',
        email: 'umamahesh@gmail.com',
        phone: '9876543210'
      },
      resume_hash: 'abc123'
    }
  },

  // Response 3: Mixed camelCase and snake_case
  mixedFormat: {
    basic: {
      firstName: 'Uma',
      last_name: 'Maheswar',
      email: 'umamahesh@gmail.com',
      phone: '9876543210'
    }
  }
};

function testMapperLogic() {
  console.log('\n' + '='.repeat(80));
  console.log('TESTING RESUME PARSER MAPPING');
  console.log('='.repeat(80) + '\n');

  Object.entries(SAMPLE_PARSER_RESPONSES).forEach(([format, response]) => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Testing Format: ${format}`);
    console.log(`${'='.repeat(80)}\n`);
    
    console.log('Raw Response:');
    console.log(JSON.stringify(response, null, 2));
    
    // Simulate the extraction logic
    let parsedResume = response;
    let resumeHash = response.resume_hash || null;
    
    if (response.data) {
      console.log('\n✓ Found "data" wrapper');
      const wrappedData = response.data;
      parsedResume = wrappedData.parsed || wrappedData;
      resumeHash = wrappedData.resume_hash || resumeHash;
    }
    
    if (parsedResume && parsedResume.parsed && typeof parsedResume.parsed === 'object') {
      console.log('✓ Found nested "parsed" object');
      resumeHash = parsedResume.resume_hash || resumeHash;
      parsedResume = parsedResume.parsed;
    }
    
    console.log('\nExtracted data has keys:', Object.keys(parsedResume));
    console.log('Extracted resume data:');
    console.log(JSON.stringify(parsedResume, null, 2));
    console.log('\nResume hash:', resumeHash);
  });
}

async function testActualParser() {
  console.log('\n' + '='.repeat(80));
  console.log('TESTING ACTUAL AZURE PARSER API');
  console.log('='.repeat(80) + '\n');

  try {
    // Check if there's a sample resume file
    const sampleResumePath = path.join(__dirname, 'test_resume.docx');
    
    if (!fs.existsSync(sampleResumePath)) {
      console.log('❌ No test_resume.docx found. Skipping actual API test.');
      console.log('   You can place a test resume at:', sampleResumePath);
      return;
    }

    console.log(`Testing with file: ${sampleResumePath}`);
    
    const form = new FormData();
    const fileBuffer = fs.readFileSync(sampleResumePath);
    form.append('file', fileBuffer, { filename: 'test_resume.docx', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

    console.log('Sending request to parser...');
    const resp = await axios.post(
      'https://resume-parser-api-hp-260406.azurewebsites.net/resume/parse-preview',
      form,
      {
        headers: { ...form.getHeaders() },
        timeout: 300000,
      }
    );

    console.log('\n✓ Got response from parser');
    console.log('Response status:', resp.status);
    console.log('Response headers:', resp.headers);
    console.log('\nFull API response:');
    console.log(JSON.stringify(resp.data, null, 2));

    // Now test extraction logic on real response
    let parsedResume = resp.data;
    let resumeHash = resp.data.resume_hash || null;
    
    if (resp.data.data) {
      console.log('\n✓ Found "data" wrapper in real response');
      const wrappedData = resp.data.data;
      parsedResume = wrappedData.parsed || wrappedData;
      resumeHash = wrappedData.resume_hash || resumeHash;
    }
    
    if (parsedResume && parsedResume.parsed && typeof parsedResume.parsed === 'object') {
      console.log('✓ Found nested "parsed" object in real response');
      resumeHash = parsedResume.resume_hash || resumeHash;
      parsedResume = parsedResume.parsed;
    }

    console.log('\n📊 EXTRACTED DATA ANALYSIS:');
    console.log('Keys found:', Object.keys(parsedResume || {}));
    console.log('\nParsed data:');
    console.log(JSON.stringify(parsedResume, null, 2));

  } catch (error) {
    console.error('❌ Error testing actual parser:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.status, error.response.data);
    }
  }
}

async function main() {
  testMapperLogic();
  await testActualParser();
}

main().catch(console.error);
