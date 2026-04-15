#!/usr/bin/env node

/**
 * Direct Mapping Function Test
 * Tests the parser response extraction and mapping WITHOUT needing authentication
 * 
 * This will help us understand if the issue is in the mapping function or elsewhere
 */

// Mock responses that might come from the Azure Resume Parser API
const mockResponses = {
  // Scenario 1: What we're likely getting (snake_case from Ollama)
  scenario1_likely: {
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
      }
    ],
    workexp: [
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
      { language_name: 'English' },
      { language_name: 'Hindi' }
    ]
  },

  // Scenario 2: Wrapped response from API
  scenario2_wrapped: {
    data: {
      parsed: {
        first_name: 'Uma',
        last_name: 'Maheswar Reddy',
        email: 'umamahesh@gmail.com',
        phone: '9876543210',
        education: [
          {
            college_name: 'IIT Delhi',
            degree: 'B.Tech',
            cgpa: 8.5
          }
        ]
      },
      resume_hash: 'abc123xyz'
    }
  },

  // Scenario 3: Empty/minimal response
  scenario3_empty: {
    basic: {},
    education: []
  }
};

// Replicate the exact mapping function from the backend
function mapParserToDraft(parsed) {
  if (!parsed || typeof parsed !== 'object') {
    console.error("[MAPPER] ❌ ERROR: parsed is not an object");
    return createEmptyDraft();
  }

  const cleanNumber = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    const str = String(val).replace('%', '').split('/')[0].trim();
    const num = parseFloat(str) || 0;
    return num;
  };

  // FIX: Check if basicSource exists as a nested object
  const basicSource = parsed?.basic && typeof parsed.basic === 'object' ? parsed.basic : parsed;

  // School data
  const schoolDataFromApi = parsed?.school || parsed?.schooling || parsed?.school_education || parsed?.schoolEducation || [];
  const educationArray = parsed?.education || parsed?.college || parsed?.college_education || parsed?.collegeEducation || [];

  const schoolArray = [];
  if (Array.isArray(schoolDataFromApi) && schoolDataFromApi.length > 0) {
    for (const s of schoolDataFromApi) {
      const standard = String(s?.standard || s?.std || s?.class || s?.grade || '').toLowerCase().trim();
      
      let mappedStandard = '';
      if (standard.includes('x') && !standard.includes('xi')) {
        mappedStandard = '10th';
      } else if (standard.includes('xii') || standard.includes('12')) {
        mappedStandard = '12th';
      } else if (standard === '10') {
        mappedStandard = '10th';
      } else if (standard === '12') {
        mappedStandard = '12th';
      }
      
      if (mappedStandard) {
        const schoolEntry = {
          standard: mappedStandard,
          schoolName: s?.school_name || s?.school || s?.institution_name || s?.schoolName || '',
          board: s?.board || s?.board_name || s?.board_of_education || s?.boardName || '',
          percentage: cleanNumber(s?.percentage || s?.marks || s?.score || s?.gpa),
          passingYear: cleanNumber(s?.passing_year || s?.year || s?.year_of_passing || s?.passingYear || s?.graduationYear),
        };
        schoolArray.push(schoolEntry);
      }
    }
  }

  const collegeArray = [];
  if (Array.isArray(educationArray) && educationArray.length > 0) {
    for (let idx = 0; idx < educationArray.length; idx++) {
      const e = educationArray[idx];
      const collegeEntry = {
        collegeName: e?.college_name || e?.college || e?.institution_name || e?.university || e?.collegeName || '',
        courseName: e?.course_name || e?.course || e?.degree || e?.program || e?.courseName || '',
        specializationName: e?.specialization_name || e?.specialization || e?.major || e?.branch || e?.specializationName || '',
        startYear: cleanNumber(e?.start_year || e?.from_year || e?.year_from || e?.startYear || e?.fromYear),
        endYear: cleanNumber(e?.end_year || e?.to_year || e?.year_to || e?.endYear || e?.toYear),
        cgpa: cleanNumber(e?.cgpa || e?.gpa || e?.grade || e?.score),
        percentage: cleanNumber(e?.percentage || e?.marks || e?.score),
      };
      collegeArray.push(collegeEntry);
    }
  }

  const result = {
    basic: {
      firstName: basicSource?.first_name || basicSource?.firstName || basicSource?.name?.first || '',
      middleName: basicSource?.middle_name || basicSource?.middleName || basicSource?.name?.middle || '',
      lastName: basicSource?.last_name || basicSource?.lastName || basicSource?.name?.last || '',
      email: basicSource?.email || basicSource?.contact?.email || '',
      phone: basicSource?.contact_number || basicSource?.phone || basicSource?.contact?.phone || basicSource?.phone_number || '',
      linkedinUrl: basicSource?.linkedin_url || basicSource?.linkedinUrl || basicSource?.linkedin || basicSource?.contact?.linkedin || '',
      githubUrl: basicSource?.github_url || basicSource?.githubUrl || basicSource?.github || basicSource?.contact?.github || '',
      portfolioUrl: basicSource?.portfolio_url || basicSource?.portfolioUrl || basicSource?.portfolio || basicSource?.contact?.portfolio || '',
      dateOfBirth: basicSource?.date_of_birth || basicSource?.dob || basicSource?.dateOfBirth || '',
      gender: basicSource?.gender || '',
      currentCity: basicSource?.current_city || basicSource?.city || basicSource?.currentCity || basicSource?.address?.city || '',
    },
    schoolEducation: schoolArray,
    collegeEducation: collegeArray,
    workExperience: (parsed?.workexp || parsed?.work_experience || parsed?.workExperience || []).map((w) => ({
      companyName: w?.company_name || w?.company || w?.companyName || '',
      location: w?.company_location || w?.location || w?.companyLocation || '',
      designation: w?.designation || w?.job_title || w?.title || '',
      employmentType: w?.employment_type || w?.type || w?.employmentType || '',
      startDate: w?.start_date || w?.startDate || w?.from || '',
      endDate: w?.end_date || w?.endDate || w?.to || '',
      isCurrent: !!w?.is_current || !!w?.current || !!w?.isCurrent,
    })),
    projects: (parsed?.projects || []).map((p) => ({
      title: p?.project_title || p?.title || p?.projectTitle || '',
      description: p?.project_description || p?.description || p?.projectDescription || '',
      achievements: p?.achievements || p?.achievement || '',
      startDate: p?.project_start_date || p?.startDate || p?.from || '',
      endDate: p?.project_end_date || p?.endDate || p?.to || '',
      skillsUsed: Array.isArray(p?.skills_used) ? p.skills_used : Array.isArray(p?.skillsUsed) ? p.skillsUsed : [],
    })),
    skills: (parsed?.skills || []).map((s) => ({
      skillName: s?.name || s?.skill_name || s?.skillName || '',
      proficiencyLevel: s?.complexity || s?.proficiency || s?.proficiencyLevel || 'Intermediate',
    })),
    languages: (parsed?.languages || []).map((l) => ({
      languageName: l?.language_name || l?.language || l?.languageName || l?.name || '',
    })),
    certifications: (parsed?.certifications || []).map((c) => ({
      certificationName: c?.certification_name || c?.name || c?.certificationName || '',
      issuingOrganization: c?.issuing_organization || c?.issuer || c?.issuingOrganization || '',
      certificationType: c?.certification_type || c?.type || c?.certificationName || '',
      issueDate: c?.issue_date || c?.issueDate || '',
      expiryDate: c?.expiry_date || c?.expiryDate || '',
      isLifetime: !!c?.is_lifetime || !!c?.isLifetime,
      certificateUrl: c?.certificate_url || c?.url || c?.certificateUrl || '',
      credentialId: c?.credential_id || c?.credentialId || '',
    })),
    interests: (parsed?.interests || []).map((i) => ({
      interestName: i?.name || i?.interest_name || i?.interestName || (typeof i === 'string' ? i : ''),
      isInferred: !!i?.is_inferred || !!i?.inferred || !!i?.isInferred,
    })),
    address: (parsed?.addresses && parsed.addresses[0]) ? {
      addressLine1: parsed.addresses[0]?.address_line_1 || parsed.addresses[0]?.line1 || parsed.addresses[0]?.addressLine1 || '',
      addressLine2: parsed.addresses[0]?.address_line_2 || parsed.addresses[0]?.line2 || parsed.addresses[0]?.addressLine2 || '',
      landmark: parsed.addresses[0]?.landmark || '',
      pincode: parsed.addresses[0]?.pincode || parsed.addresses[0]?.zip || '',
      cityName: parsed.addresses[0]?.city_name || parsed.addresses[0]?.city || parsed.addresses[0]?.cityName || '',
      stateName: parsed.addresses[0]?.state_name || parsed.addresses[0]?.state || parsed.addresses[0]?.stateName || '',
      countryName: parsed.addresses[0]?.country_name || parsed.addresses[0]?.country || parsed.addresses[0]?.countryName || '',
      addressType: parsed.addresses[0]?.address_type || parsed.addresses[0]?.type || '',
    } : {},
  };

  return result;
}

function createEmptyDraft() {
  return {
    basic: {},
    schoolEducation: [],
    collegeEducation: [],
    workExperience: [],
    projects: [],
    skills: [],
    languages: [],
    certifications: [],
    interests: [],
    address: {},
  };
}

function testScenario(scenarioName, responseData) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`SCENARIO: ${scenarioName}`);
  console.log('═'.repeat(60));

  // Simulate response extraction (similar to backend code)
  let parsedData = responseData;
  
  // Check if wrapped in data.parsed format
  if (responseData?.data?.parsed) {
    console.log("  → Detected wrapped format: data.parsed");
    parsedData = responseData.data.parsed;
  } else if (responseData?.data && !responseData?.basic) {
    console.log("  → Detected wrapped format: data");
    parsedData = responseData.data;
  }

  console.log("\n📥 Input to mapper:");
  console.log(`   Keys: ${Object.keys(parsedData).join(', ')}`);
  if (parsedData?.basic) {
    console.log(`   Basic keys: ${Object.keys(parsedData.basic).join(', ')}`);
  }

  // Run mapper
  const mapped = mapParserToDraft(parsedData);

  // Analyze Results
  console.log("\n📤 Mapping Results:");
  
  // Basic info
  const filledBasic = Object.entries(mapped.basic)
    .filter(([_, v]) => v)
    .map(([k, v]) => `${k}: ${v}`);

  const emptyBasic = Object.entries(mapped.basic)
    .filter(([_, v]) => !v)
    .map(([k]) => k);

  console.log(`\n  👤 Basic Info:`);
  if (filledBasic.length > 0) {
    console.log(`     ✓ Filled (${filledBasic.length}): `);
    filledBasic.forEach(f => console.log(`       - ${f}`));
  }
  if (emptyBasic.length > 0) {
    console.log(`     ✗ Missing (${emptyBasic.length}): ${emptyBasic.join(', ')}`);
  }

  console.log(`\n  🎓 Education: ${mapped.collegeEducation.length} entries`);
  if (mapped.collegeEducation.length > 0) {
    mapped.collegeEducation.forEach((edu, i) => {
      console.log(`     [${i}] ${edu.courseName} at ${edu.collegeName}`);
    });
  }

  console.log(`\n  🎒 School: ${mapped.schoolEducation.length} entries`);
  if (mapped.schoolEducation.length > 0) {
    mapped.schoolEducation.forEach((sch, i) => {
      console.log(`     [${i}] ${sch.standard} - ${sch.schoolName}`);
    });
  }

  console.log(`\n  💼 Work: ${mapped.workExperience.length} entries`);
  if (mapped.workExperience.length > 0) {
    mapped.workExperience.forEach((work, i) => {
      console.log(`     [${i}] ${work.designation} at ${work.companyName}`);
    });
  }

  console.log(`\n  💻 Skills: ${mapped.skills.length} entries`);
  if (mapped.skills.length > 0) {
    mapped.skills.forEach((skill, i) => {
      console.log(`     [${i}] ${skill.skillName}`);
    });
  }

  // Completeness score
  let totalItems = Object.keys(mapped.basic).length +
    (mapped.collegeEducation.length * 3) +
    (mapped.schoolEducation.length * 3) +
    (mapped.workExperience.length * 2) +
    (mapped.skills.length);

  let filledItems = filledBasic.length +
    (mapped.collegeEducation.length * 3) +
    (mapped.schoolEducation.length * 3) +
    (mapped.workExperience.length * 2) +
    (mapped.skills.length);

  const completeness = totalItems > 0 ? Math.round((filledItems / totalItems) * 100) : 0;
  
  console.log(`\n  📊 Completeness: ${completeness}%`);
}

// Run all scenarios
console.log("╔════════════════════════════════════════════════════════════╗");
console.log("║          RESUME MAPPING FUNCTION DIRECT TEST               ║");
console.log("╚════════════════════════════════════════════════════════════╝");

Object.entries(mockResponses).forEach(([name, data]) => {
  testScenario(name, data);
});

console.log(`\n${'═'.repeat(60)}`);
console.log("✅ DIRECT MAPPING TEST COMPLETE");
console.log("\nKey Findings:");
console.log("- Scenario 1 (Most Likely): Tests what the Ollama parser likely returns");
console.log("- Scenario 2 (Wrapped): Tests API-wrapped responses");
console.log("- Scenario 3 (Empty): Tests edge case with no data");
console.log("\nIf Scenario 1 completes successfully but Scenario 2 has issues,");
console.log("the problem is in response unwrapping (lines 206-232 of resumeRoutes.js)");
