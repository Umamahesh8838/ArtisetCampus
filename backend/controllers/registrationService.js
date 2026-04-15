/**
 * MIGRATED TO campus6 schema
 * Purpose: Complete registration workflow with M2M operations
 * Updated: All M2M table references to campus6 schema
 * Key M2M Tables: tbl_cp_m2m_std_skill, tbl_cp_m2m_std_lng, tbl_cp_m2m_std_interest, tbl_cp_m2m_student_certification
 * Key Tables: tbl_cp_student, tbl_cp_student_address, tbl_cp_student_school, tbl_cp_student_education, etc.
 */

const {
  resolveLanguageId,
  resolveSkillId,
  resolveInterestId,
  resolveCertificationId,
  resolvePincodeId,
  resolveCollegeId,
  resolveCourseId,
  getNextId,
  resolveGenericId,
  upsertGeographyChain,
  insertWithNextId
} = require('../utils/masterHelpers2');

const { v4: uuid } = require('uuid');
const logger = require('../utils/logger');

const dbName = process.env.DB_NAME || 'campus5';

/**
 * Process complete student registration
 * Inserts/updates all related tables in a single transaction
 * Must be called within a transaction context
 */
async function processRegistration(connection, user_id, draft) {
  logger.info(`Processing registration for user_id: ${user_id}`);

  try {
    // 1. Fetch user basic info from users table
    const [userRows] = await connection.execute(
      'SELECT first_name, last_name, email, phone FROM users WHERE id = ?',
      [user_id]
    );

    if (!userRows || userRows.length === 0) {
      throw new Error('User not found');
    }

    const u = userRows[0];
    if (!u || !u.email) {
      throw new Error(`User record is invalid or missing email for user_id: ${user_id}`);
    }

    const basic = draft.basic || {};

    // Resolve salutation_id from gender
    let salutation_id = 1; // Default: Mr.
    if (basic.salutation === 'Ms.' || basic.salutation === 'Mrs.') salutation_id = 2;
    else if (basic.salutation === 'Dr.') salutation_id = 4;
    else if (basic.gender && basic.gender.toLowerCase() === 'female') salutation_id = 2;

    // Format date of birth
    let dob = null;
    if (basic.dob) {
      try {
        dob = new Date(basic.dob).toISOString().split('T')[0];
      } catch (e) {
        logger.warn('Invalid DOB format:', basic.dob);
      }
    }

    // ========================================================================
    // 2. UPDATE/INSERT Student Profile (tbl_cp_student)
    // ========================================================================
    const [existingStudent] = await connection.execute(
      'SELECT student_id FROM tbl_cp_student WHERE student_id = ?',
      [user_id]
    );

    if (existingStudent && existingStudent.length > 0) {
      // Update existing
      await connection.execute(
        `UPDATE tbl_cp_student SET 
         salutation_id=?, first_name=?, last_name=?, email=?, contact_number=?,
         linkedin_url=?, github_url=?, date_of_birth=?, gender=?, status='Active', updated_at=NOW()
         WHERE student_id=?`,
        [
          salutation_id,
          basic.firstName || u.first_name,
          basic.lastName || u.last_name,
          u.email,
          basic.contactNumber || u.phone,
          basic.linkedinUrl || null,
          basic.githubUrl || null,
          dob,
          basic.gender || 'Male',
          user_id
        ]
      );
    } else {
      // Insert new
      await connection.execute(
        `INSERT INTO tbl_cp_student 
         (student_id, salutation_id, first_name, last_name, email, contact_number, 
          linkedin_url, github_url, date_of_birth, gender, is_active, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'Active')`,
        [
          user_id,
          salutation_id,
          basic.firstName || u.first_name,
          basic.lastName || u.last_name,
          u.email,
          basic.contactNumber || u.phone,
          basic.linkedinUrl || null,
          basic.githubUrl || null,
          dob,
          basic.gender || 'Male'
        ]
      );
    }

    // ========================================================================
    // 3. ADDRESS MANAGEMENT (tbl_cp_student_address with geography hierarchy)
    // ========================================================================
    await connection.execute(
      'DELETE FROM tbl_cp_student_address WHERE student_id = ?',
      [user_id]
    );

    const addresses = draft.address || {};
    const addressesToSave = [];

    if (addresses.current && addresses.current.line1) {
      addressesToSave.push({ ...addresses.current, type: 'current' });
    }
    if (addresses.permanent && addresses.permanent.line1) {
      addressesToSave.push({ ...addresses.permanent, type: 'permanent' });
    }

    for (const addr of addressesToSave) {
      try {
        const pinId = await upsertGeographyChain(
          connection,
          addr.country || addr.countryName || null,
          addr.state || addr.stateName || null,
          addr.city || addr.cityName || null,
          addr.pincode,
          addr.areaName || addr.area || null
        );

        await insertWithNextId(
          connection,
          'tbl_cp_student_address',
          'address_id',
          ['student_id', 'address_line_1', 'address_line_2', 'landmark', 'pincode_id', 'address_type'],
          [user_id, addr.line1 || '', addr.line2 || '', addr.landmark || '', pinId, addr.type]
        );
      } catch (err) {
        logger.warn(`Failed to insert address for student_id ${user_id}:`, err.message);
      }
    }

    // ========================================================================
    // 4. SCHOOL EDUCATION (tbl_cp_student_school)
    // ========================================================================
    await connection.execute(
      'DELETE FROM tbl_cp_student_school WHERE student_id = ?',
      [user_id]
    );

    const schoolEntries = [];
    if (draft.school?.tenth?.school) {
      schoolEntries.push({ ...draft.school.tenth, standard: '10th' });
    }
    if (draft.school?.twelfth?.school) {
      schoolEntries.push({ ...draft.school.twelfth, standard: '12th' });
    }

    for (const school of schoolEntries) {
      try {
        await insertWithNextId(
          connection,
          'tbl_cp_student_school',
          'school_id',
          ['student_id', 'standard', 'board', 'school_name', 'percentage', 'passing_year'],
          [
            user_id,
            school.standard,
            school.board || '',
            school.school,
            parseFloat(school.percentage) || 0,
            school.year || ''
          ]
        );
      } catch (err) {
        logger.warn(`Failed to insert school for student_id ${user_id}:`, err.message);
      }
    }

    // ========================================================================
    // 5. COLLEGE EDUCATION (tbl_cp_student_education)
    // ========================================================================
    await connection.execute(
      'DELETE FROM tbl_cp_student_education WHERE student_id = ?',
      [user_id]
    );

    const college = draft.college || {};
    if (college.college) {
      try {
        let colId = await resolveCollegeId(connection, college.college);
        let corId = await resolveCourseId(connection, college.course || college.degree);

        // Ensure college exists
        if (colId) {
          const [checkCol] = await connection.execute(
            'SELECT college_id FROM tbl_cp_mcolleges WHERE college_id = ? LIMIT 1',
            [colId]
          );
          if (!checkCol || checkCol.length === 0) {
            colId = await insertWithNextId(
              connection,
              'tbl_cp_mcolleges',
              'college_id',
              ['college_name', 'is_active'],
              [college.college || 'Unknown', 1]
            );
          }
        }

        // Ensure course exists
        if (corId) {
          const [checkCourse] = await connection.execute(
            'SELECT course_id FROM tbl_cp_mcourses WHERE course_id = ? LIMIT 1',
            [corId]
          );
          if (!checkCourse || checkCourse.length === 0) {
            corId = await insertWithNextId(
              connection,
              'tbl_cp_mcourses',
              'course_id',
              ['course_name', 'is_active'],
              [college.course || college.degree || 'Unknown', 1]
            );
          }
        }

        // Insert education record
        await insertWithNextId(
          connection,
          'tbl_cp_student_education',
          'edu_id',
          ['student_id', 'college_id', 'course_id', 'start_year', 'end_year', 'cgpa', 'percentage'],
          [
            user_id,
            colId,
            corId,
            college.startYear || null,
            college.endYear || null,
            parseFloat(college.cgpa) || 0,
            parseFloat(college.percentage) || 0
          ]
        );
      } catch (err) {
        logger.warn(`Failed to insert college education for student_id ${user_id}:`, err.message);
      }
    }

    // ========================================================================
    // 6. SEMESTER SUBJECT MARKS (tbl_cp_student_subject_marks)
    // ========================================================================
    await connection.execute(
      'DELETE FROM tbl_cp_student_subject_marks WHERE student_id = ?',
      [user_id]
    );

    const semesters = draft.semesters || [];
    for (const sem of semesters) {
      for (const sub of (sem.subjects || [])) {
        if (!sub.name) continue;

        try {
          const cols = ['student_id', 'semester_name', 'subject_name', 'credits', 'internal_marks', 'external_marks'];
          const vals = [
            user_id,
            sem.name || 'Semester',
            sub.name,
            parseInt(sub.credits) || 0,
            parseFloat(sub.internal) || 0,
            parseFloat(sub.external) || 0
          ];

          if (sub.grade) {
            cols.push('grade');
            vals.push(sub.grade);
          }

          const placeholders = cols.map(() => '?').join(',');
          await connection.execute(
            `INSERT INTO tbl_cp_student_subject_marks (${cols.join(',')}) VALUES (${placeholders})`,
            vals
          );
        } catch (err) {
          logger.warn(`Failed to insert subject marks:`, err.message);
        }
      }
    }

    // ========================================================================
    // 7. WORK EXPERIENCE (tbl_cp_student_workexp)
    // ========================================================================
    await connection.execute(
      'DELETE FROM tbl_cp_student_workexp WHERE student_id = ?',
      [user_id]
    );

    for (const exp of (draft.workExperience || [])) {
      if (!exp.company) continue;

      try {
        await insertWithNextId(
          connection,
          'tbl_cp_student_workexp',
          'workexp_id',
          [
            'student_id',
            'company_name',
            'company_location',
            'designation',
            'employment_type',
            'start_date',
            'end_date',
            'is_current'
          ],
          [
            user_id,
            exp.company,
            exp.location || '',
            exp.designation || '',
            exp.type || 'Full-Time',
            exp.startDate || null,
            exp.current ? null : (exp.endDate || null),
            exp.current ? 1 : 0
          ]
        );
      } catch (err) {
        logger.warn(`Failed to insert work experience:`, err.message);
      }
    }

    // ========================================================================
    // 8. PROJECTS (tbl_cp_studentprojects)
    // ========================================================================
    await connection.execute(
      'DELETE FROM tbl_cp_studentprojects WHERE student_id = ?',
      [user_id]
    );

    for (const proj of (draft.projects || [])) {
      if (!proj.title) continue;

      try {
        await insertWithNextId(
          connection,
          'tbl_cp_studentprojects',
          'project_id',
          [
            'student_id',
            'project_title',
            'project_description',
            'achievements',
            'project_start_date',
            'project_end_date'
          ],
          [
            user_id,
            proj.title,
            proj.description || '',
            proj.achievements || '',
            proj.startDate || null,
            proj.endDate || null
          ]
        );
      } catch (err) {
        logger.warn(`Failed to insert project:`, err.message);
      }
    }

    // ========================================================================
    // 9. SKILLS (M2M via tbl_cp_m2m_std_skill)
    // ========================================================================
    await connection.execute(
      'DELETE FROM tbl_cp_m2m_std_skill WHERE student_id = ?',
      [user_id]
    );

    for (const skill of (draft.skills || [])) {
      if (!skill.name) continue;

      try {
        const skillId = await resolveSkillId(connection, skill.name);
        if (skillId) {
          await connection.execute(
            'INSERT INTO tbl_cp_m2m_std_skill (student_id, skill_id) VALUES (?, ?)',
            [user_id, skillId]
          );
        }
      } catch (err) {
        logger.warn(`Failed to insert skill ${skill.name}:`, err.message);
      }
    }

    // ========================================================================
    // 10. LANGUAGES (M2M via tbl_cp_m2m_std_lng)
    // ========================================================================
    await connection.execute(
      'DELETE FROM tbl_cp_m2m_std_lng WHERE student_id = ?',
      [user_id]
    );

    for (const lang of (draft.languages || [])) {
      if (!lang.name) continue;

      try {
        const langId = await resolveLanguageId(connection, lang.name);
        if (langId) {
          await connection.execute(
            'INSERT INTO tbl_cp_m2m_std_lng (student_id, language_id) VALUES (?, ?)',
            [user_id, langId]
          );
        }
      } catch (err) {
        logger.warn(`Failed to insert language ${lang.name}:`, err.message);
      }
    }

    // ========================================================================
    // 11. INTERESTS (M2M via tbl_cp_m2m_std_interest)
    // ========================================================================
    await connection.execute(
      'DELETE FROM tbl_cp_m2m_std_interest WHERE student_id = ?',
      [user_id]
    );

    for (const interest of (draft.interests || [])) {
      if (!interest) continue;

      try {
        const interestId = await resolveInterestId(connection, interest);
        if (interestId) {
          await connection.execute(
            'INSERT INTO tbl_cp_m2m_std_interest (student_id, interest_id) VALUES (?, ?)',
            [user_id, interestId]
          );
        }
      } catch (err) {
        logger.warn(`Failed to insert interest ${interest}:`, err.message);
      }
    }

    // ========================================================================
    // 12. CERTIFICATIONS (M2M via tbl_cp_m2m_student_certification)
    // ========================================================================
    await connection.execute(
      'DELETE FROM tbl_cp_m2m_student_certification WHERE student_id = ?',
      [user_id]
    );

    for (const cert of (draft.certifications || [])) {
      if (!cert.name) continue;

      try {
        const certId = await resolveCertificationId(connection, cert.name, cert.organization);
        if (certId) {
          await connection.execute(
            `INSERT INTO tbl_cp_m2m_student_certification 
             (student_id, certification_id, issue_date, expiry_date, certificate_url)
             VALUES (?, ?, ?, ?, ?)`,
            [
              user_id,
              certId,
              cert.issueDate || null,
              cert.expiryDate || null,
              cert.url || '',
            ]
          );
        }
      } catch (err) {
        logger.warn(`Failed to insert certification ${cert.name}:`, err.message);
      }
    }

    // ========================================================================
    // 13. MARK REGISTRATION AS COMPLETE
    // ========================================================================
    await connection.execute(
      'UPDATE users SET registration_draft = ?, registration_step = ?, is_registration_complete = 1, updated_at = NOW() WHERE id = ?',
      [JSON.stringify(draft), 'completed', user_id]
    );

    logger.info(`Registration completed successfully for user_id: ${user_id}`);
  } catch (err) {
    logger.error('processRegistration error:', err);
    throw err;
  }
}

module.exports = { processRegistration };
