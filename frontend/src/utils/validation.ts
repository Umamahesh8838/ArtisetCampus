export const validateRegistrationData = (draftData: any) => {
  let isValid = true;
  const errors: Record<string, string> = {};

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Adjusted regex slightly to be valid JS syntax: escaping +
  const phoneRegex = /^(\+91[-\s]?)?[0]?(91)?[6789]\d{9}$/;

  const isValidYear = (year: any) => {
    if (!year) return false;
    const y = parseInt(year);
    if (isNaN(y)) return false;
    return y >= 1990 && y <= new Date().getFullYear();
  };

  const isValidPercentage = (val: any) => {
    if (val === undefined || val === null || val === '') return false;
    if (String(val).includes('%')) return false; // Reject "95%" format
    const n = parseFloat(val);
    if (isNaN(n)) return false;
    return n >= 0 && n <= 100;
  };

  const isValidCGPA = (val: any) => {
    if (val === undefined || val === null || val === '') return true;
    if (String(val).includes('/')) return false;
    const n = parseFloat(val);
    if (isNaN(n)) return false;
    return n >= 0 && n <= 10;
  };

  const isAlpha = (str: string) => /^[A-Za-z\s]+$/.test(str);

  // 1. BASIC PROFILE
  const basic = draftData?.basic || {};
  
  // first_name
  if (!basic.firstName || basic.firstName.trim().length < 2 || !isAlpha(basic.firstName)) {
    isValid = false;
    errors.firstName = "First name is required, minimum 2 characters, only alphabets.";
  }
  // last_name
  if (!basic.lastName || basic.lastName.trim().length < 2 || !isAlpha(basic.lastName)) {
    isValid = false;
    errors.lastName = "Last name is required, minimum 2 characters, only alphabets.";
  }
  // email
  if (!basic.email || !emailRegex.test(basic.email)) {
    isValid = false;
    errors.email = "Valid email is required.";
  }
  // contact_number
  if (!basic.contactNumber || !phoneRegex.test(basic.contactNumber)) {
    isValid = false;
    errors.contactNumber = "Valid contact number is required (10 digits, +91 allowed).";
  }
  // gender
  if (!basic.gender) {
    isValid = false;
    errors.gender = "Gender is required.";
  }
  // dob (age 15 to 35)
  if (!basic.dob) {
    isValid = false;
    errors.dob = "Date of birth is required.";
  } else {
    const dob = new Date(basic.dob);
    if (isNaN(dob.getTime())) {
      isValid = false;
      errors.dob = "Valid date of birth is required.";
    } else {
      const ageDifMs = Date.now() - dob.getTime();
      const ageDate = new Date(ageDifMs);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      if (age < 15 || age > 35) {
        isValid = false;
        errors.dob = "Age must be between 15 and 35.";
      }
    }
  }

  // 2. SCHOOL EDUCATION
  const school = draftData?.school || {};
  const hasTenth = !!(school.tenth?.school && String(school.tenth.school).trim().length >= 1);
  const hasTwelfth = !!(school.twelfth?.school && String(school.twelfth.school).trim().length >= 1);
  
  if (!hasTenth && !hasTwelfth) {
    isValid = false;
    errors.school = "At least one school education entry (10th or 12th) is required.";
  }

  ['tenth', 'twelfth'].forEach(std => {
    const s = school[std];
    // If the section exists and has some data
    if (s && s.school && String(s.school).trim().length >= 1) {
      if (!s.board) {
        isValid = false;
        errors[`school_${std}_board`] = "Board is required.";
      }
      if (!s.school || s.school.trim().length < 3) { // Note backend normalizes to s.school
        isValid = false;
        errors[`school_${std}_school`] = "School name is required and must be at least 3 characters.";
      }
      if (!isValidPercentage(s.percentage)) {
        isValid = false;
        errors[`school_${std}_percentage`] = "Valid percentage (0-100 without '%') is required.";
      }
      if (!isValidYear(s.year)) { // backend uses s.year
        isValid = false;
        errors[`school_${std}_year`] = "Valid 4 digit passing year is required.";
      }
    }
  });

  // 3. COLLEGE EDUCATION
  // Draft data puts college details in `college` object directly or array?
  // Our Context mapParserToDraft uses arrays for college. Let's check backend `normalizeDraft`...
  // wait, from `normalizeDraft` it uses `draft.college` as a SINGLE object with properties.
  // Let's assume draft.college is an object or array. Based on `normalizeDraft`, it is an object.
  // Wait, Profile.tsx `regDraft.college` mapped from `mapRawResumeToDraftFormat`. I need to ensure if it's array or object.
  // The user prompt says "At least ONE entry required". This heavily implies it might be an array.
  // Let's check frontend/src/contexts/RegistrationContext.tsx ResumeData interface:
  // college?: { college?: string; course?: string; ... } (Single object)
  const collegeArr = Array.isArray(draftData?.college) ? draftData?.college : [draftData?.college].filter(Boolean);
  
  // Actually, the requirements say "At least ONE entry required". If it's single object, it just means the college fields are required.
  const c = draftData?.college || {};
  if (!c.college) {
    isValid = false;
    errors.college_name = "College name is required.";
  }
  if (!c.course) {
    isValid = false;
    errors.college_course = "Course name is required.";
  }
  if (!c.startYear) {
    isValid = false;
    errors.college_startYear = "College start year is required.";
  }
  if (c.cgpa && !isValidCGPA(c.cgpa)) {
    isValid = false;
    errors.college_cgpa = "Valid CGPA (0-10, no '/') is required.";
  }
  if (c.percentage !== undefined && c.percentage !== null && c.percentage !== '') {
    if (!isValidPercentage(c.percentage)) {
        isValid = false;
        errors.college_percentage = "Valid College Percentage (0-100 without '%') is required.";
    }
  }

  // 4. SKILLS
  const skills = draftData?.skills || [];
  let validSkillFound = false;
  if (Array.isArray(skills)) {
    for (let i = 0; i < skills.length; i++) {
      const sk = skills[i]?.name?.trim();
      if (sk && sk.toLowerCase() !== "string") {
        validSkillFound = true;
        break;
      }
    }
  }
  if (!validSkillFound) {
    isValid = false;
    errors.skills = "At least one valid skill is required.";
  }

  // 5. LANGUAGES
  const languages = draftData?.languages || [];
  let validLangFound = false;
  if (Array.isArray(languages)) {
    for (let i = 0; i < languages.length; i++) {
        if (languages[i]?.name?.trim()) {
            validLangFound = true;
            break;
        }
    }
  }
  if (!validLangFound) {
    isValid = false;
    errors.languages = "At least one valid language is required.";
  }

  // 6. WORK EXPERIENCE (Optional)
  const work = draftData?.workExperience || draftData?.work || [];
  if (Array.isArray(work) && work.length > 0) {
    work.forEach((w, idx) => {
      // if any field is filled, or even if object exists, checking required fields
      if (!w.company) {
        isValid = false;
        errors[`work_${idx}_company`] = "Company name is required for work experience.";
      }
      if (!w.designation) {
        isValid = false;
        errors[`work_${idx}_designation`] = "Designation is required for work experience.";
      }
      if (!w.startDate) {
        isValid = false;
        errors[`work_${idx}_startDate`] = "Start date is required for work experience.";
      }
    });
  }

  // 7. PROJECTS (Optional)
  const projects = draftData?.projects || [];
  if (Array.isArray(projects) && projects.length > 0) {
    projects.forEach((p, idx) => {
      if (!p.title) {
        isValid = false;
        errors[`project_${idx}_title`] = "Project title is required.";
      }
      if (!p.description) {
        isValid = false;
        errors[`project_${idx}_description`] = "Project description is required.";
      }
    });
  }

  // 8. CERTIFICATIONS (Optional)
  const certs = draftData?.certifications || [];
  if (Array.isArray(certs) && certs.length > 0) {
    certs.forEach((c, idx) => {
      if (!c.name) {
        isValid = false;
        errors[`cert_${idx}_name`] = "Certification name is required.";
      }
      if (!c.organization && !c.issuer) {
        isValid = false;
        errors[`cert_${idx}_organization`] = "Certification organization is required.";
      }
    });
  }

  return { isValid, errors };
};
