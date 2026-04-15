// Unified ATS parser mapping utility
// Converts raw backend parser JSON into the standardized draftData structure expected by the RegistrationContext

export const mapRawResumeToDraftFormat = (parsedDraft: any) => {
  const basic = parsedDraft.basic || parsedDraft.basicProfile || {};

  const schoolEducation = parsedDraft.schoolEducation || parsedDraft.school || [];
  const tenthObj = schoolEducation.find((s: any) => String(s.standard).includes('10')) || {};
  const twelfthObj = schoolEducation.find((s: any) => String(s.standard).includes('12')) || {};

  const school = {
    tenth: {
      board: "",
      school: tenthObj.schoolName || tenthObj.board || "",
      percentage: Number(tenthObj.percentage) || undefined,
      year: tenthObj.passingYear ? String(tenthObj.passingYear) : "",
    },
    twelfth: {
      board: "",
      school: twelfthObj.schoolName || twelfthObj.board || "",
      percentage: Number(twelfthObj.percentage) || undefined,
      year: twelfthObj.passingYear ? String(twelfthObj.passingYear) : "",
    }
  };

  const collegeEducation = parsedDraft.collegeEducation || parsedDraft.education || [];
  const latestCollege = collegeEducation[0] || {};
  const college = {
    college: latestCollege.collegeName || latestCollege.institution || "",
    course: latestCollege.courseName || latestCollege.degree || "",
    specialization: latestCollege.specializationName || latestCollege.branch || "",
    cgpa: latestCollege.cgpa ? String(latestCollege.cgpa) : "",
    percentage: latestCollege.percentage ? String(latestCollege.percentage) : "",
    startYear: latestCollege.startYear ? String(latestCollege.startYear) : "",
    endYear: latestCollege.endYear ? String(latestCollege.endYear) : "",
  };

  const addr = parsedDraft.address || {};
  const address = {
    current: {
      line1: addr.addressLine1 || "",
      line2: addr.addressLine2 || "",
      city: addr.cityName || "",
      state: addr.stateName || "",
      pincode: addr.pincode ? String(addr.pincode) : "",
      country: addr.countryName || "",
    }
  };

  const workExperience = (parsedDraft.workExperience || parsedDraft.workexp || []).map((w: any) => ({
    company: w.companyName || w.company || "",
    designation: w.designation || "",
    location: w.location || "",
    type: w.employmentType || w.type || "",
    startDate: w.startDate || "",
    endDate: w.endDate || "",
    current: !!(w.isCurrent || w.current),
  }));

  const projects = (parsedDraft.projects || []).map((p: any) => ({
    title: p.title || "",
    description: p.description || "",
    achievements: p.achievements || "",
    startDate: p.startDate || "",
    endDate: p.endDate || "",
    skills: p.skillsUsed || p.skills || [],
  }));

  const skills = (parsedDraft.skills || []).map((s: any) => ({
    name: s.skillName || s.name || "",
    version: s.version || "",
    complexity: s.proficiencyLevel || s.complexity || "",
  }));

  const languages = (parsedDraft.languages || []).map((l: any) => ({
    name: l.languageName || l.name || "",
    proficiency: l.proficiency || "",
  }));

  const certifications = (parsedDraft.certifications || []).map((c: any) => ({
    name: c.certificationName || c.name || "",
    issuer: c.issuingOrganization || c.issuer || "",
    date: c.issueDate || c.date || "",
    expiry: c.expiryDate || c.expiry || "",
    url: c.certificateUrl || c.url || "",
  }));

  const interests = (parsedDraft.interests || []).map((i: any) => i.interestName || i).filter(Boolean);

  return {
    basic: {
      firstName: basic.firstName || basic.first_name || "",
      middleName: basic.middleName || basic.middle_name || "",
      lastName: basic.lastName || basic.last_name || "",
      email: basic.email || "",
      contactNumber: basic.contactNumber || basic.phone || basic.contact_number || "",
      gender: basic.gender || "",
      dob: basic.dateOfBirth || basic.dob || "",
      linkedIn: basic.linkedinUrl || basic.linkedin_url || "",
      github: basic.githubUrl || basic.github_url || "",
      city: basic.currentCity || basic.city || ""
    },
    address,
    school,
    college,
    semesters: [], // ATS parsing typically doesn't map full semesters
    work: workExperience,
    projects,
    skills,
    languages,
    certifications,
    interests
  };
};
