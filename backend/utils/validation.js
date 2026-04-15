// Lightweight registration draft validator and normalizer
// Designed to be defensive: trims strings, enforces max lengths, normalizes dates and numbers,
// and sets safe defaults so downstream mapping won't hit null/constraint errors.

function trimStr(s, maxLen = 255) {
  if (s === undefined || s === null) return null;
  const t = String(s).trim();
  return t.length > maxLen ? t.slice(0, maxLen) : t;
}

function toSafeNumber(v, fallback = null) {
  if (v === undefined || v === null || v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeDate(input) {
  if (!input) return null;
  const d = new Date(input);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
}

function normalizeDraft(raw) {
  if (!raw || typeof raw !== 'object') return {};
  const draft = JSON.parse(JSON.stringify(raw)); // shallow clone

  // Basic block
  draft.basic = draft.basic || {};
  draft.basic.firstName = trimStr(draft.basic.firstName || draft.basic.first_name || '', 100) || null;
  draft.basic.lastName = trimStr(draft.basic.lastName || draft.basic.last_name || '', 100) || null;
  draft.basic.gender = trimStr(draft.basic.gender || 'Male', 20) || 'Male';
  draft.basic.contactNumber = trimStr(draft.basic.contactNumber || draft.basic.contact_number || '', 30) || null;
  draft.basic.linkedIn = trimStr(draft.basic.linkedIn || draft.basic.linkedin || '', 200);
  draft.basic.github = trimStr(draft.basic.github || '', 200);
  draft.basic.dob = normalizeDate(draft.basic.dob || draft.basic.dateOfBirth || null);

  // Address block
  draft.address = draft.address || {};
  ['current','permanent'].forEach((k) => {
    const a = draft.address[k] || {};
    if (!a) return;
    a.line1 = trimStr(a.line1 || a.address_line_1 || '', 200) || null;
    a.line2 = trimStr(a.line2 || a.address_line_2 || '', 200) || null;
    a.landmark = trimStr(a.landmark || '', 200) || null;
    a.city = trimStr(a.city || a.cityName || a.city_name || '', 100) || null;
    a.state = trimStr(a.state || a.stateName || a.state_name || '', 100) || null;
    a.country = trimStr(a.country || a.countryName || a.country_name || '', 100) || null;
    a.pincode = trimStr(a.pincode || a.pin || a.zip || '', 20) || null;
    a.area_name = trimStr(a.area_name || a.area || a.areaName || '', 150) || null;
    draft.address[k] = a;
  });

  // School
  draft.school = draft.school || {};
  ['tenth','twelfth'].forEach((k) => {
    const s = draft.school[k] || {};
    if (!s) return;
    s.school = trimStr(s.school || s.school_name || '', 200) || null;
    s.board = trimStr(s.board || '', 100) || null;
    s.percentage = toSafeNumber(s.percentage, 0);
    s.year = trimStr(s.year || s.passingYear || '', 10) || null;
    draft.school[k] = s;
  });

  // College
  draft.college = draft.college || {};
  draft.college.college = trimStr(draft.college.college || draft.college.college_name || '', 200) || null;
  draft.college.course = trimStr(draft.college.course || draft.college.degree || '', 200) || null;
  draft.college.startYear = toSafeNumber(draft.college.startYear || draft.college.start_year || null, null);
  draft.college.endYear = toSafeNumber(draft.college.endYear || draft.college.end_year || null, null);
  draft.college.cgpa = toSafeNumber(draft.college.cgpa, 0);
  draft.college.percentage = toSafeNumber(draft.college.percentage, 0);

  // Semesters
  draft.semesters = Array.isArray(draft.semesters) ? draft.semesters.map(sem => {
    return {
      name: trimStr(sem.name || sem.semester || '', 100) || 'Semester',
      subjects: Array.isArray(sem.subjects) ? sem.subjects.map(sub => ({
        name: trimStr(sub.name || sub.subject || '', 200) || null,
        credits: toSafeNumber(sub.credits, 0),
        internal: toSafeNumber(sub.internal, 0),
        external: toSafeNumber(sub.external, 0),
        grade: trimStr(sub.grade || '', 20) || null
      })).filter(s => s.name) : []
    };
  }) : [];

  // Work Experience
  draft.workExperience = Array.isArray(draft.workExperience) ? draft.workExperience.map(w => ({
    company: trimStr(w.company || w.company_name || '', 200) || null,
    location: trimStr(w.location || w.company_location || '', 200) || null,
    designation: trimStr(w.designation || '', 200) || null,
    type: trimStr(w.type || w.employment_type || 'Full-Time', 50) || 'Full-Time',
    startDate: normalizeDate(w.startDate || w.start_date || null),
    endDate: normalizeDate(w.endDate || w.end_date || null),
    current: !!w.current
  })).filter(x => x.company) : [];

  // Projects
  draft.projects = Array.isArray(draft.projects) ? draft.projects.map(p => ({
    title: trimStr(p.title || p.project_title || '', 200) || null,
    description: trimStr(p.description || p.project_description || '', 1000) || null,
    achievements: trimStr(p.achievements || '', 500) || null,
    startDate: normalizeDate(p.startDate || p.project_start_date || null),
    endDate: normalizeDate(p.endDate || p.project_end_date || null)
  })).filter(p => p.title) : [];

  // Skills, languages, interests, certifications
  draft.skills = Array.isArray(draft.skills) ? draft.skills.map(s => ({ name: trimStr(s.name || s.skill || '', 200) })).filter(s => s.name) : [];
  draft.languages = Array.isArray(draft.languages) ? draft.languages.map(l => ({ name: trimStr(l.name || l.language || '', 200) })).filter(l => l.name) : [];
  draft.interests = Array.isArray(draft.interests) ? draft.interests.map(i => trimStr(i || '')).filter(Boolean) : [];
  draft.certifications = Array.isArray(draft.certifications) ? draft.certifications.map(c => ({ name: trimStr(c.name || '', 200) || null, organization: trimStr(c.organization || c.issuer || '', 200) || null, issueDate: normalizeDate(c.issueDate || c.issue_date || null), expiryDate: normalizeDate(c.expiryDate || c.expiry_date || null), url: trimStr(c.url || c.certificate_url || '', 1000) || null })).filter(c => c.name) : [];

  return draft;
}

module.exports = { normalizeDraft };
