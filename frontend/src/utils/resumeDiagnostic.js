/**
 * Frontend Resume Upload Diagnostic
 * Place this in your React component to debug the actual data flow
 * 
 * Usage: Add this code to ResumeUploader.tsx to debug real uploads
 */

// Add this console.log helper to see structured data better
const logStructure = (data, label) => {
  console.log(`\n📋 ${label}:`);
  console.log(`  Type: ${typeof data}`);
  console.log(`  Is Array: ${Array.isArray(data)}`);
  if (typeof data === 'object') {
    console.log(`  Keys: ${Object.keys(data).join(', ')}`);
    console.log(`  JSON:`, JSON.stringify(data, null, 2));
  }
  return data;
};

// Add to your file upload handler
const handleResumeUpload = async (file) => {
  console.log("📤 === RESUME UPLOAD DIAGNOSTIC ===");
  console.log(`File name: ${file.name}`);
  console.log(`File size: ${file.size} bytes`);
  console.log(`File type: ${file.type}`);

  const formData = new FormData();
  formData.append('resume', file);

  try {
    console.log("\n🔄 Sending to backend...");
    const response = await axios.post('http://localhost:3000/resume/parse-preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    console.log("\n✅ Response received!");
    logStructure(response.data, "Full Response");

    // Check expected structure
    const { draft, resume_hash } = response.data;
    
    console.log("\n🔍 Structure Check:");
    console.log(`  ✓ Has 'draft': ${!!draft}`);
    console.log(`  ✓ Has 'resume_hash': ${!!resume_hash}`);

    if (draft) {
      console.log("\n📦 Draft Structure:");
      console.log(`  Basic: ${draft.basic ? '✓' : '✗'}`);
      if (draft.basic) {
        console.log(`    Fields: ${Object.keys(draft.basic).join(', ')}`);
        console.log(`    Filled: ${Object.values(draft.basic).filter(v => v).length}/${Object.keys(draft.basic).length}`);
      }

      console.log(`  School Education: ${draft.schoolEducation ? `✓ (${draft.schoolEducation.length})` : '✗'}`);
      console.log(`  College Education: ${draft.collegeEducation ? `✓ (${draft.collegeEducation.length})` : '✗'}`);
      console.log(`  Work Experience: ${draft.workExperience ? `✓ (${draft.workExperience.length})` : '✗'}`);
      console.log(`  Skills: ${draft.skills ? `✓ (${draft.skills.length})` : '✗'}`);
    }

    // Set to context
    if (onResumeParsed) {
      console.log("\n📌 Setting context...");
      onResumeParsed(response.data);
      console.log("✓ Context updated");
    }

  } catch (error) {
    console.error("❌ Upload failed!");
    console.error("Error:", error.message);
    if (error.response?.data) {
      console.error("Server response:", error.response.data);
    }
  }
};

// Add to your context consumer/form filler
const fillFormFromDraft = (draft) => {
  console.log("\n📝 === FORM FILLING DIAGNOSTIC ===");
  logStructure(draft, "Draft Data");

  if (!draft?.basic) {
    console.warn("⚠️  No basic info in draft!");
    return;
  }

  console.log("\n🔄 Filling form fields...");
  
  const basicFields = ['firstName', 'lastName', 'email', 'phone'];
  basicFields.forEach(field => {
    const value = draft.basic[field];
    console.log(`  ${field}: "${value}" ${value ? '✓' : '✗'}`);
    // Your form update logic here
    // setFormData(prev => ({ ...prev, [field]: value }));
  });

  if (draft.collegeEducation?.length > 0) {
    console.log(`\n🎓 Found ${draft.collegeEducation.length} education entries:`);
    draft.collegeEducation.forEach((edu, idx) => {
      console.log(`  [${idx}] ${edu.collegeName} - ${edu.courseName}`);
    });
  }

  if (draft.skills?.length > 0) {
    console.log(`\n💻 Found ${draft.skills.length} skills:`);
    draft.skills.forEach((skill, idx) => {
      console.log(`  [${idx}] ${skill.skillName} (${skill.proficiencyLevel})`);
    });
  }
};

// Add this to test with mock data
const testWithMockResume = () => {
  const mockDraft = {
    basic: {
      firstName: 'Uma',
      lastName: 'Mahesh',
      email: 'uma@example.com',
      phone: '9876543210'
    },
    schoolEducation: [
      {
        standard: '12th',
        schoolName: 'DPS Delhi',
        board: 'CBSE',
        percentage: 95,
        passingYear: 2020
      }
    ],
    collegeEducation: [
      {
        collegeName: 'IIT Delhi',
        courseName: 'B.Tech',
        specializationName: 'CSE',
        startYear: 2020,
        endYear: 2024,
        cgpa: 8.5
      }
    ],
    skills: [
      { skillName: 'Python', proficiencyLevel: 'Expert' },
      { skillName: 'React', proficiencyLevel: 'Advanced' }
    ]
  };

  console.log("🧪 Testing with mock data...");
  fillFormFromDraft(mockDraft);
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { logStructure, handleResumeUpload, fillFormFromDraft, testWithMockResume };
}
