/**
 * Minimal test to capture and log parser response structure
 * Run this to understand what Azure API returns
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Test with a simple payload structure to see what parser expects/returns
async function testParserStructure() {
  console.log('Testing parser API structure...\n');

  // Create a minimal test document
  const testResume = Buffer.from(`
    Uma Maheswar Reddy
    umamahesh@gmail.com | 9876543210
    
    Education:
    B.Tech Computer Science, IIT Delhi (2020-2024), CGPA: 8.5
    XII, DPS School, CBSE (2020), 95%
    
    Experience:
    Google | SDE Intern | May 2023 - Jul 2023 | Bangalore
    
    Skills: Python, JavaScript, React
  `, 'utf-8');

  try {
    const form = new FormData();
    form.append('file', testResume, { 
      filename: 'test_resume.txt', 
      contentType: 'text/plain' 
    });

    console.log('Sending request to parser...\n');
    const startTime = Date.now();
    
    const resp = await axios.post(
      'https://resume-parser-api-hp-260406.azurewebsites.net/resume/parse-preview',
      form,
      {
        headers: { ...form.getHeaders() },
        timeout: 300000,
      }
    );

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✓ Response received in ${duration}s\n`);
    console.log('Status:', resp.status);
    console.log('\nResponse Structure Analysis:');
    console.log('Top-level keys:', Object.keys(resp.data));
    
    // Deep dive into structure
    console.log('\n--- FULL RESPONSE ---');
    console.log(JSON.stringify(resp.data, null, 2));
    
    // Show specific field structures if they exist
    const data = resp.data;
    if (data.parsed) {
      console.log('\n✓ Found "parsed" key');
      console.log('  parsed keys:', Object.keys(data.parsed));
      console.log('  parsed.basic keys:', data.parsed.basic ? Object.keys(data.parsed.basic) : 'N/A');
      console.log('  parsed.education type:', Array.isArray(data.parsed.education) ? 'Array' : typeof data.parsed.education);
    }
    
    if (data.data) {
      console.log('\n✓ Found "data" wrapper key');
      console.log('  data.data keys:', Object.keys(data.data));
    }
    
    if (data.basic) {
      console.log('\n✓ Found "basic" key at root level');
      console.log('  basic keys:', Object.keys(data.basic));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.code) {
      console.error('Code:', error.code);
    }
  }
}

testParserStructure().catch(console.error);
