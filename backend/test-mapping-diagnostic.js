/**
 * Complete diagnostic test for resume parsing pipeline
 * This will help identify exactly where the data gets lost
 */

// Simulated response from Azure parser based on Ollama
const SIMULATED_RESPONSES = {
  // Most likely format based on LLM/Ollama output
  format1_direct_parsed: {
    basic: {
      first_name: 'Uma',
      last_name: 'Maheswar Reddy',
      email: 'umamahesh@gmail.com',
      contact_number: '9876543210',
      linkedin_url: 'https://linkedin.com/in/umamahesh',
      github_url: 'https://github.com/umamahesh'
    },
    education: [
      {
        institution_name: 'IIT Delhi',
        degree: 'B.Tech',
        major: 'Computer Science & Engineering',
        start_year: 2020,
        end_year: 2024,
        gpa: 8.5
      }
    ],
    school: [
      {
        standard: 'XII',
        school_name: 'Delhi Public School',
        board: 'CBSE',
        percentage: 95.5,
        passing_year: 2020
      },
      {
        standard: 'X',
        school_name: 'Delhi Public School',
        board: 'CBSE',
        percentage: 96,
        passing_year: 2018
      }
    ],
    workexperience: [
      {
        company_name: 'Google',
        job_title: 'Software Engineering Intern',
        location: 'Bangalore',
        employment_type: 'Internship',
        start_date: 'May 2023',
        end_date: 'July 2023'
      }
    ],
    skills: [
      { name: 'Python', complexity: 'Expert' },
      { name: 'JavaScript', complexity: 'Advanced' },
      { name: 'React', complexity: 'Advanced' }
    ],
    languages: [
      { language_name: 'English', proficiency: 'Native' },
      { language_name: 'Hindi', proficiency: 'Fluent' }
    ]
  },

  // Format from wrapped API response
  format2_wrapped: {
    success: true,
    data: {
      parsed: {
        basic: {
          firstName: 'Uma',
          lastName: 'Maheswar Reddy',
          email: 'umamahesh@gmail.com',
          phone: '9876543210'
        },
        education: [
          {
            collegeName: 'IIT Delhi',
            degree: 'B.Tech',
            specialization: 'CSE',
            cgpa: 8.5
          }
        ]
      },
      resume_hash: 'abc123'
    }
  },

  // Format with snake_case naming
  format3_snake_case: {
    first_name: 'Uma',
    last_name: 'Maheswar Reddy',
    email: 'umamahesh@gmail.com',
    phone_number: '9876543210',
    work_experience: [
      {
        company_name: 'Google',
        designation: 'SDE Intern',
        location: 'Bangalore'
      }
    ]
  }
};

// Mock mapping function (same as in actual code)
function mapParserToDraft(parsed) {
  console.log("\n=== MAPPER CALLED ===");
  console.log("Input keys:", Object.keys(parsed));
  
  const result = {
    basic: {
      firstName: parsed?.first_name || parsed?.firstName || '',
      lastName: parsed?.last_name || parsed?.lastName || '',
      email: parsed?.email || '',
      phone: parsed?.contact_number || parsed?.phone || parsed?.phone_number || '',
    },
    school: (parsed?.school || []).map(s => ({
      standard: s?.standard || '',
      schoolName: s?.school_name || s?.schoolName || '',
      board: s?.board || '',
      percentage: s?.percentage || 0,
      passingYear: s?.passing_year || s?.passingYear || 0
    })),
    education: (parsed?.education || []).map(e => ({
      collegeName: e?.institution_name || e?.collegeName || '',
      degree: e?.degree || '',
      gpa: e?.gpa || e?.cgpa || 0
    })),
    workexp: (parsed?.workexperience || parsed?.work_experience || []).map(w => ({
      company: w?.company_name || '',
      designation: w?.job_title || w?.designation || '',
      location: w?.location || ''
    })),
    skills: (parsed?.skills || []).map(s => ({
      name: s?.name || '',
      level: s?.complexity || s?.proficiency || ''
    }))
  };
  
  console.log("Output:");
  console.log(JSON.stringify(result, null, 2));
  return result;
}

// Test function
function runTests() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║         RESUME PARSER DIAGNOSTIC TEST SUITE                ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  Object.entries(SIMULATED_RESPONSES).forEach(([format, response]) => {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`Format: ${format}`);
    console.log(`${'═'.repeat(60)}`);
    
    console.log("\n📥 INPUT (Parser Response):");
    console.log(JSON.stringify(response, null, 2));
    
    console.log("\n→ PROCESSING...");
    
    // Simulate extraction logic
    let parsedData = response;
    if (response.data?.parsed) {
      console.log("  ✓ Detected wrapped format, extracting...");
      parsedData = response.data.parsed;
    }
    
    console.log("\n📤 AFTER EXTRACTION:");
    console.log(JSON.stringify(parsedData, null, 2));
    
    // Run mapper
    console.log("\n🔄 RUNNING MAPPER...");
    const mapped = mapParserToDraft(parsedData);
    
    // Analyze results
    console.log("\n📊 RESULTS ANALYSIS:");
    console.log(`  Basic info filled: ${Object.values(mapped.basic).filter(v => v).length}/${Object.keys(mapped.basic).length}`);
    console.log(`  School entries: ${mapped.school.length}`);
    console.log(`  Education entries: ${mapped.education.length}`);
    console.log(`  Work experience entries: ${mapped.workexp.length}`);
    console.log(`  Skills: ${mapped.skills.length}`);
    
    // Show what's missing
    const emptyFields = Object.entries(mapped.basic).filter(([_, v]) => !v).map(([k]) => k);
    if (emptyFields.length > 0) {
      console.log(`  ⚠️  Empty fields: ${emptyFields.join(', ')}`);
    }
  });

  console.log(`\n${'═'.repeat(60)}`);
  console.log("TEST COMPLETE");
  console.log('═'.repeat(60));
}

// Run tests
runTests();
