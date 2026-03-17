// Use the global `process` object for environment variables (do not shadow it).
const {
  resolveLanguageId, resolveSkillId, resolveInterestId,
  resolveCertificationId, resolvePincodeId, resolveCollegeId, resolveCourseId,
  getNextId, resolveGenericId, upsertGeographyChain, insertWithNextId
} = require('../utils/masterHelpers2');
const dbName = process.env.DB_NAME || 'campus5';

// Extracted registration mapping logic. This function performs all DB writes
// using the provided connection but does NOT commit or release it. Caller must
// manage transaction boundaries.
async function processRegistration(connection, user_id, draft) {
  // 1. Fetch Auth details (name/email/phone from signup)
  const [userRows] = await connection.execute('SELECT first_name, last_name, email, phone FROM users WHERE id = ?', [user_id]);
  const u = userRows[0];

  const basic = draft.basic || {};

  // Resolve Salutation
  let salutation_id = 1;
  if (basic.salutation) {
    if (basic.salutation === 'Ms.' || basic.salutation === 'Mrs.') salutation_id = 2;
    else if (basic.salutation === 'Dr.') salutation_id = 4;
  } else {
    salutation_id = basic.gender === 'Female' ? 2 : 1;
  }

  // Format DOB
  let dob = null;
  if (basic.dob) {
    try { dob = new Date(basic.dob).toISOString().split('T')[0]; } catch(e) { dob = null; }
  }

  // 2. Profile UPSERT into tbl_cp_student (student_id = users.id as shared PK)
  const [studentRows] = await connection.execute('SELECT student_id FROM tbl_cp_student WHERE student_id = ?', [user_id]);
  if (studentRows.length > 0) {
    await connection.execute(
      `UPDATE tbl_cp_student SET salutation_id=?, first_name=?, last_name=?, email=?, contact_number=?, linkedin_url=?, github_url=?, date_of_birth=?, gender=?, status=? WHERE student_id=?`,
      [salutation_id, basic.firstName || u.first_name, basic.lastName || u.last_name, u.email, basic.contactNumber || u.phone, basic.linkedIn || null, basic.github || null, dob, basic.gender || 'Male', 'Active', user_id]
    );
  } else {
    await connection.execute(
      `INSERT INTO tbl_cp_student (student_id, salutation_id, first_name, last_name, email, contact_number, linkedin_url, github_url, date_of_birth, gender, user_type, is_active, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Student', 1, 'Active')`,
      [user_id, salutation_id, basic.firstName || u.first_name, basic.lastName || u.last_name, u.email, basic.contactNumber || u.phone, basic.linkedIn || null, basic.github || null, dob, basic.gender || 'Male']
    );
  }

  // 3. Addresses — DELETE then INSERT (no manual ID)
  const addr = draft.address || {};
  await connection.execute(`DELETE FROM tbl_cp_student_address WHERE student_id = ?`, [user_id]);
  const addressesToSave = [];
  if (addr.current && addr.current.line1) addressesToSave.push({ ...addr.current, type: 'current' });
  if (addr.permanent && addr.permanent.line1) addressesToSave.push({ ...addr.permanent, type: 'permanent' });

  for (const a of addressesToSave) {
    const pinId = await upsertGeographyChain(connection, a.country || a.countryName || null, a.state || a.stateName || null, a.city || a.cityName || null, a.pincode, a.area_name || a.area || a.areaName || null);
    await insertWithNextId(connection, 'tbl_cp_student_address', 'address_id', ['student_id','address_line_1','address_line_2','landmark','pincode_id','address_type'], [user_id, a.line1 || '', a.line2 || '', a.landmark || '', pinId, a.type]);
  }

  // 4. School
  await connection.execute(`DELETE FROM tbl_cp_student_school WHERE student_id = ?`, [user_id]);
  const schoolEntries = [];
  if (draft.school?.tenth?.school) schoolEntries.push({ ...draft.school.tenth, standard: '10th' });
  if (draft.school?.twelfth?.school) schoolEntries.push({ ...draft.school.twelfth, standard: '12th' });

  for (const s of schoolEntries) {
    await insertWithNextId(connection, 'tbl_cp_student_school', 'school_id', ['student_id','standard','board','school_name','percentage','passing_year'], [user_id, s.standard, s.board || '', s.school, parseFloat(s.percentage) || 0, s.year || '']);
  }

  // 5. College
  await connection.execute(`DELETE FROM tbl_cp_student_education WHERE student_id = ?`, [user_id]);
  const college = draft.college || {};
  if (college.college) {
    let colId = await resolveCollegeId(connection, college.college);
    let corId = await resolveCourseId(connection, college.course || college.degree);
    if (colId) {
      const [checkC] = await connection.execute('SELECT college_id FROM tbl_cp_mcolleges WHERE college_id = ? LIMIT 1', [colId]);
      if (!checkC || checkC.length === 0) {
        const newColId = await insertWithNextId(connection, 'tbl_cp_mcolleges', 'college_id', ['college_name','spoc_name','spoc_phone','spoc_email','tpo_name','tpo_phone','tpo_email','student_coordinator_name','student_coordinator_phone','student_coordinator_email','priority','created_at','updated_at'], [college.college || 'Unknown','Not Assigned','0000000000','noreply@college.com','Not Assigned','0000000000','noreply@college.com','Not Assigned','0000000000','noreply@college.com',5,new Date(),new Date()]);
        colId = newColId;
      }
    }
    if (corId) {
      const [checkCr] = await connection.execute('SELECT course_id FROM tbl_cp_mcourses WHERE course_id = ? LIMIT 1', [corId]);
      if (!checkCr || checkCr.length === 0) {
        const newCorId = await insertWithNextId(connection, 'tbl_cp_mcourses', 'course_id', ['course_name'], [college.course || college.degree || 'Unknown']);
        corId = newCorId;
      }
    }
    const eduId = await insertWithNextId(connection, 'tbl_cp_student_education', 'edu_id', ['student_id','college_id','course_id','start_year','end_year','cgpa','percentage'], [user_id, colId, corId, college.startYear || null, college.endYear || null, parseFloat(college.cgpa) || 0, parseFloat(college.percentage) || 0]);
  }

  // 6. Semester Subject Marks
  await connection.execute(`DELETE FROM tbl_cp_student_subject_marks WHERE student_id = ?`, [user_id]);
  const semesters = draft.semesters || [];

  const [colInfo] = await connection.execute(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
    [dbName, 'tbl_cp_student_subject_marks']
  );
  const availableCols = new Set((colInfo || []).map(r => r.COLUMN_NAME));

  const candidateNames = {
    semester_name: ['semester_name', 'sem_name', 'semester'],
    subject_name: ['subject_name', 'subject', 'sub_name', 'subject_title'],
    credits: ['credits', 'credit_points'],
    internal_marks: ['internal_marks', 'internal', 'internal_mark'],
    external_marks: ['external_marks', 'external', 'external_mark'],
    total_marks: ['total_marks', 'total', 'marks'],
    grade: ['grade', 'letter_grade']
  };

  const resolvedCols = {};
  for (const [logical, candidates] of Object.entries(candidateNames)) {
    for (const c of candidates) {
      if (availableCols.has(c)) { resolvedCols[logical] = c; break; }
    }
  }

  for (const sem of semesters) {
    const sem_name = sem.name || 'Semester';
    for (const sub of (sem.subjects || [])) {
      if (!sub.name && !resolvedCols.subject_name) continue;

      const cols = [];
      const vals = [];
      cols.push('student_id'); vals.push(user_id);
      if (resolvedCols.semester_name) { cols.push(resolvedCols.semester_name); vals.push(sem_name); }
      if (resolvedCols.subject_name) { cols.push(resolvedCols.subject_name); vals.push(sub.name || ''); }
      if (resolvedCols.credits) { cols.push(resolvedCols.credits); vals.push(parseInt(sub.credits) || 0); }
      const internal = parseFloat(sub.internal) || 0;
      const external = parseFloat(sub.external) || 0;
      if (resolvedCols.internal_marks) { cols.push(resolvedCols.internal_marks); vals.push(internal); }
      if (resolvedCols.external_marks) { cols.push(resolvedCols.external_marks); vals.push(external); }
      if (resolvedCols.total_marks) { cols.push(resolvedCols.total_marks); vals.push(internal + external); }
      if (resolvedCols.grade) { cols.push(resolvedCols.grade); vals.push(sub.grade || ''); }

      if (cols.length > 0) {
        const placeholders = cols.map(() => '?').join(', ');
        const sql = `INSERT INTO tbl_cp_student_subject_marks (${cols.join(', ')}) VALUES (${placeholders})`;
        await connection.execute(sql, vals);
      }
    }
  }

  // 7. Work Experience
  await connection.execute(`DELETE FROM tbl_cp_student_workexp WHERE student_id = ?`, [user_id]);
  for (const exp of (draft.workExperience || [])) {
    if (!exp.company) continue;
    await insertWithNextId(connection, 'tbl_cp_student_workexp', 'workexp_id', ['student_id','company_name','company_location','designation','employment_type','start_date','end_date','is_current'], [user_id, exp.company, exp.location || '', exp.designation || '', exp.type || 'Full-Time', exp.startDate || null, exp.current ? null : (exp.endDate || null), exp.current ? 1 : 0]);
  }

  // 8. Projects
  await connection.execute(`DELETE FROM tbl_cp_studentprojects WHERE student_id = ?`, [user_id]);
  for (const proj of (draft.projects || [])) {
    if (!proj.title) continue;
    await insertWithNextId(connection, 'tbl_cp_studentprojects', 'project_id', ['student_id','project_title','project_description','achievements','project_start_date','project_end_date'], [user_id, proj.title, proj.description || '', proj.achievements || '', proj.startDate || null, proj.endDate || null]);
  }

  // 9. Skills M2M
  await connection.execute(`DELETE FROM tbl_cp_m2m_std_skill WHERE student_id = ?`, [user_id]);
  for (const s of (draft.skills || [])) {
    if (!s.name) continue;
    const sId = await resolveSkillId(connection, s.name);
    if (sId) await connection.execute(`INSERT IGNORE INTO tbl_cp_m2m_std_skill (student_id, skill_id) VALUES (?, ?)`, [user_id, sId]);
  }

  // 10. Languages M2M
  await connection.execute(`DELETE FROM tbl_cp_m2m_std_lng WHERE student_id = ?`, [user_id]);
  for (const l of (draft.languages || [])) {
    if (!l.name) continue;
    const lId = await resolveLanguageId(connection, l.name);
    if (lId) await connection.execute(`INSERT IGNORE INTO tbl_cp_m2m_std_lng (student_id, language_id) VALUES (?, ?)`, [user_id, lId]);
  }

  // 11. Interests M2M
  await connection.execute(`DELETE FROM tbl_cp_m2m_std_interest WHERE student_id = ?`, [user_id]);
  for (const i of (draft.interests || [])) {
    const iId = await resolveInterestId(connection, i);
    if (iId) await connection.execute(`INSERT IGNORE INTO tbl_cp_m2m_std_interest (student_id, interest_id) VALUES (?, ?)`, [user_id, iId]);
  }

  // 12. Certifications M2M
  await connection.execute(`DELETE FROM tbl_cp_m2m_student_certification WHERE student_id = ?`, [user_id]);
  for (const c of (draft.certifications || [])) {
    if (!c.name) continue;
    const cId = await resolveCertificationId(connection, c.name, c.organization);
    if (cId) await connection.execute(
      `INSERT IGNORE INTO tbl_cp_m2m_student_certification (student_id, certification_id, issue_date, expiry_date, certificate_url) VALUES (?, ?, ?, ?, ?)`,
      [user_id, cId, c.issueDate || null, c.expiryDate || null, c.url || '']
    );
  }

  // 13. Mark registration as complete
  await connection.execute(
    'UPDATE users SET registration_draft = ?, registration_step = ?, is_registration_complete = ? WHERE id = ?',
    [JSON.stringify(draft), 'completed', true, user_id]
  );
}

module.exports = { processRegistration };
