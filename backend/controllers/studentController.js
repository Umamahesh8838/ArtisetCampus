// MIGRATED TO campus6 schema - Student profile and dashboard management
// Changed: Updated M2M joins, Enhanced dashboard data, Added complete profile methods

const { pool } = require('../config/db');
const { buildDraftFromDb } = require('../utils/draftExtractor');
const logger = require('../utils/logger');

/**
 * Get student dashboard data with applications, open drives, upcoming interviews, achievements
 */
async function getDashboardData(req, res) {
  try {
    const studentId = req.user?.id || req.user?.user_id;
    
    if (!studentId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // 1. Get student basic info
    const [studentRows] = await pool.execute(
      `SELECT first_name, last_name, email, contact_number, profile_photo_url 
       FROM tbl_cp_student WHERE student_id = ? LIMIT 1`,
      [studentId]
    );
    
    const student = studentRows.length > 0 ? studentRows[0] : null;
    
    // 2. Get recent applications with drive & JD details
    const [applications] = await pool.execute(
      `SELECT a.application_id, a.serial_no, a.status, a.application_date,
              d.drive_name, j.title as job_title, c.name as company_name
       FROM tbl_cp_application a
       JOIN tbl_cp_recruitment_drive d ON a.drive_id = d.drive_id
       JOIN tbl_cp_job_description j ON d.jd_id = j.jd_id
       LEFT JOIN tbl_cp_mcompany c ON j.company_id = c.company_id
       WHERE a.student_id = ?
       ORDER BY a.application_date DESC LIMIT 10`,
      [studentId]
    );
    
    // 3. Get open recruitment drives (not yet applied to)
    const [openDrives] = await pool.execute(
      `SELECT d.drive_id, d.drive_name, d.start_date, d.end_date,
              j.title as job_title, j.salary_min, j.salary_max, 'INR' as currency,
              c.name as company_name
       FROM tbl_cp_recruitment_drive d
       JOIN tbl_cp_job_description j ON d.jd_id = j.jd_id
       LEFT JOIN tbl_cp_mcompany c ON j.company_id = c.company_id
       WHERE d.status = 'Active' 
       AND d.drive_id NOT IN (
         SELECT drive_id FROM tbl_cp_application WHERE student_id = ?
       )
       ORDER BY d.start_date DESC LIMIT 10`,
      [studentId]
    );
    
    // 4. Get upcoming interview sessions
    let upcomingInterview = null;
    const [interviews] = await pool.execute(
      `SELECT i.session_id, i.session_date, i.session_time, i.interviewer_id as panel_id,
              d.drive_name, a.serial_no
       FROM tbl_cp_interview_session i
       JOIN tbl_cp_application a ON i.application_id = a.application_id
       JOIN tbl_cp_recruitment_drive d ON a.drive_id = d.drive_id
       WHERE a.student_id = ? AND i.session_date >= CURDATE()
       ORDER BY i.session_date ASC, i.session_time ASC LIMIT 1`,
      [studentId]
    );
    
    if (interviews.length > 0) {
      const interview = interviews[0];
      upcomingInterview = {
        session_id: interview.session_id,
        date: new Date(interview.session_date).toLocaleDateString(),
        time: interview.session_time ? interview.session_time.substring(0, 5) : 'TBA',
        company_drive: interview.drive_name,
        serial_no: interview.serial_no
      };
    }
    
    // 5. Get profile completion metrics
    const [education] = await pool.execute(
      'SELECT cgpa FROM tbl_cp_student_education WHERE student_id = ? LIMIT 1',
      [studentId]
    );
    
    const cgpa = education.length > 0 ? parseFloat(education[0].cgpa).toFixed(2) : '0.00';
    
    // 6. Count certifications
    const [certCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM tbl_cp_m2m_student_certification WHERE student_id = ?',
      [studentId]
    );
    
    // 7. Count skills
    const [skillCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM tbl_cp_m2m_std_skill WHERE student_id = ?',
      [studentId]
    );

    // NEW METRICS FOR DASHBOARD
    let examData = [];
    let avgExamScore = 0;
    let interviewScore = 0;
    let nextExam = "None Scheduled";

    try {
        // Exam Data
        const [exams] = await pool.execute(`
            SELECT s.subject_name as name, m.marks_obtained as score
            FROM tbl_cp_student_subject_marks m
            JOIN tbl_cp_college_sem_subject c ON m.college_sem_subject_id = c.college_sem_subject_id
            JOIN tbl_cp_msubjects s ON c.subject_id = s.subject_id
            WHERE m.student_id = ?
            ORDER BY m.created_at DESC
            LIMIT 5
        `, [studentId]);
        if (exams.length > 0) {
            examData = exams.map(e => ({ name: e.name, score: parseFloat(e.score) || 0 }));
            avgExamScore = Math.round(examData.reduce((acc, curr) => acc + curr.score, 0) / examData.length);
        }
    } catch (e) {
        logger.error('Exam Data query failed:', e.message);
    }

    try {
        // Interview Score (average of all interviews for this student)
        const [interviewsAvg] = await pool.execute(`
            SELECT AVG(i.total_score) as avg_score
            FROM tbl_cp_interview_session i
            JOIN tbl_cp_application a ON i.application_id = a.application_id
            WHERE a.student_id = ?
        `, [studentId]);
        if (interviewsAvg[0] && interviewsAvg[0].avg_score) {
            interviewScore = Math.round(parseFloat(interviewsAvg[0].avg_score));
        }
    } catch (e) {
        logger.error('Interview Score query failed:', e.message);
    }

    try {
        // Next Exam
        const [nextExams] = await pool.execute(`
            SELECT e.exam_date, r.round_name
            FROM tbl_cp_exam_session e
            JOIN tbl_cp_application a ON e.application_id = a.application_id
            LEFT JOIN tbl_cp_jd_round_config rc ON e.round_config_id = rc.round_config_id
            LEFT JOIN tbl_cp_recruitment_drive_round r ON rc.round_config_id = r.round_id
            WHERE a.student_id = ? AND e.exam_date >= CURDATE()
            ORDER BY e.exam_date ASC
            LIMIT 1
        `, [studentId]);
        if (nextExams.length > 0) {
            nextExam = nextExams[0].round_name ? nextExams[0].round_name : "Upcoming Exam";
        }
    } catch (e) {
        logger.error('Next Exam query failed:', e.message);
    }
    
    // 8. Count languages
    const [langCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM tbl_cp_m2m_std_lng WHERE student_id = ?',
      [studentId]
    );
    
    // 9. Application statistics
    const [appStats] = await pool.execute(
      `SELECT status, COUNT(*) as count FROM tbl_cp_application 
       WHERE student_id = ? GROUP BY status`,
      [studentId]
    );
    
    const statusCounts = {};
    appStats.forEach(stat => {
      statusCounts[stat.status] = stat.count;
    });
    
    res.json({
      // Flat properties expected by regular frontend Dashboard.tsx (Legacy/Current):
      applications: applications.slice(0, 10),
      openDrives: openDrives.length > 0 ? openDrives : [],
      upcomingInterview,
      certifications: certCount[0].count,
      skills: skillCount[0].count,
      cgpa: cgpa,
      examData,
      avgExamScore,
      interviewScore,
      nextExam,

      // New properties expected by newer components (student/dashboard object):
      student,
      dashboard: {
        applicationStats: {
          total: applications.length,
          ...statusCounts
        },
        recentApplications: applications.slice(0, 5),
        openDrives: openDrives.length > 0 ? openDrives : [],
        upcomingInterview,
        profileCompletion: {
          educationCgpa: cgpa,
          certifications: certCount[0].count,
          skills: skillCount[0].count,
          languages: langCount[0].count
        }
      }
    });
  } catch (err) {
    logger.error('Get dashboard data error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get complete student profile (for profile view/edit page)
 */
async function getStudentProfile(req, res) {
  try {
    const studentId = req.user?.id;
    
    if (!studentId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Use draftExtractor to build complete profile
    const profile = await buildDraftFromDb(studentId);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json({ profile });
  } catch (err) {
    logger.error('Get student profile error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update student profile (basic info)
 */
async function updateStudentProfile(req, res) {
  try {
    const studentId = req.user?.id;
    const {
      first_name,
      middle_name,
      last_name,
      email,
      alternateEmail,
      contact_number,
      alt_contact_number,
      linkedIn,
      github,
      portfolio,
      date_of_birth,
      gender,
      current_city
    } = req.body;
    
    if (!studentId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Build dynamic update query
    const updates = [];
    const values = [];
    
    if (first_name !== undefined) { updates.push('first_name = ?'); values.push(first_name); }
    if (middle_name !== undefined) { updates.push('middle_name = ?'); values.push(middle_name); }
    if (last_name !== undefined) { updates.push('last_name = ?'); values.push(last_name); }
    if (email !== undefined) { updates.push('email = ?'); values.push(email); }
    if (alternateEmail !== undefined) { updates.push('alt_email = ?'); values.push(alternateEmail); }
    if (contact_number !== undefined) { updates.push('contact_number = ?'); values.push(contact_number); }
    if (alt_contact_number !== undefined) { updates.push('alt_contact_number = ?'); values.push(alt_contact_number); }
    if (linkedIn !== undefined) { updates.push('linkedin_url = ?'); values.push(linkedIn); }
    if (github !== undefined) { updates.push('github_url = ?'); values.push(github); }
    if (portfolio !== undefined) { updates.push('portfolio_url = ?'); values.push(portfolio); }
    if (date_of_birth !== undefined) { updates.push('date_of_birth = ?'); values.push(date_of_birth); }
    if (gender !== undefined) { updates.push('gender = ?'); values.push(gender); }
    if (current_city !== undefined) { updates.push('current_city = ?'); values.push(current_city); }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(studentId);
    updates.push('updated_date = NOW()');
    
    await pool.execute(
      `UPDATE tbl_cp_student SET ${updates.join(', ')} WHERE student_id = ?`,
      values
    );
    
    logger.info(`Student ${studentId} profile updated`);
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    logger.error('Update student profile error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Add/Update student address
 */
async function updateStudentAddress(req, res) {
  try {
    const studentId = req.user?.id;
    const { addressType, ...addressData } = req.body;
    
    if (!studentId || !addressType) {
      return res.status(400).json({ error: 'Missing studentId or addressType' });
    }
    
    let conn;
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();
      
      // Check if address exists
      const [existing] = await conn.execute(
        'SELECT address_id FROM tbl_cp_student_address WHERE student_id = ? AND address_type = ?',
        [studentId, addressType]
      );
      
      if (existing.length > 0) {
        // Update existing
        const addressId = existing[0].address_id;
        await conn.execute(
          `UPDATE tbl_cp_student_address SET address_line_1 = ?, address_line_2 = ?, 
           care_of = ?, landmark = ?, area_name = ?, pincode_id = ?, latitude = ?, longitude = ?,
           updated_date = NOW() WHERE address_id = ?`,
          [
            addressData.line1,
            addressData.line2,
            addressData.careOf,
            addressData.landmark,
            addressData.area,
            addressData.pincodeId || null,
            addressData.latitude || 0,
            addressData.longitude || 0,
            addressId
          ]
        );
      } else {
        // Insert new
        const [maxId] = await conn.execute(
          'SELECT MAX(address_id) as max_id FROM tbl_cp_student_address'
        );
        const nextAddressId = (maxId[0].max_id || 0) + 1;
        
        await conn.execute(
          `INSERT INTO tbl_cp_student_address 
           (address_id, student_id, address_type, address_line_1, address_line_2, care_of, 
            landmark, area_name, pincode_id, latitude, longitude, created_date, updated_date)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            nextAddressId,
            studentId,
            addressType,
            addressData.line1,
            addressData.line2,
            addressData.careOf,
            addressData.landmark,
            addressData.area,
            addressData.pincodeId || null,
            addressData.latitude || 0,
            addressData.longitude || 0
          ]
        );
      }
      
      await conn.commit();
      logger.info(`Student ${studentId} address (${addressType}) updated`);
      res.json({ message: 'Address updated successfully' });
    } finally {
      if (conn) conn.release();
    }
  } catch (err) {
    logger.error('Update student address error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get student's skills with fetch from M2M table
 */
async function getStudentSkills(req, res) {
  try {
    const studentId = req.user?.id;
    
    if (!studentId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const [skills] = await pool.execute(
      `SELECT s.skill_id, s.name, s.complexity, s.version
       FROM tbl_cp_m2m_std_skill m
       JOIN tbl_cp_mskills s ON m.skill_id = s.skill_id
       WHERE m.student_id = ?
       ORDER BY s.name`,
      [studentId]
    );
    
    res.json({ skills });
  } catch (err) {
    logger.error('Get student skills error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Add skill to student (M2M operation)
 */
async function addStudentSkill(req, res) {
  try {
    const studentId = req.user?.id;
    const { skillId } = req.body;
    
    if (!studentId || !skillId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if skill already added
    const [existing] = await pool.execute(
      'SELECT * FROM tbl_cp_m2m_std_skill WHERE student_id = ? AND skill_id = ?',
      [studentId, skillId]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Skill already added' });
    }
    
    // Add skill
await pool.execute(
      `INSERT INTO tbl_cp_m2m_std_skill (student_id, skill_id)
         VALUES (?, ?)`,
        [studentId, skillId]
    );
    
    logger.info(`Skill ${skillId} added to student ${studentId}`);
    res.status(201).json({ message: 'Skill added successfully' });
  } catch (err) {
    logger.error('Add student skill error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Remove skill from student (M2M delete)
 */
async function removeStudentSkill(req, res) {
  try {
    const studentId = req.user?.id;
    const { skillId } = req.params;
    
    if (!studentId || !skillId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    await pool.execute(
      'DELETE FROM tbl_cp_m2m_std_skill WHERE student_id = ? AND skill_id = ?',
      [studentId, skillId]
    );
    
    logger.info(`Skill ${skillId} removed from student ${studentId}`);
    res.json({ message: 'Skill removed successfully' });
  } catch (err) {
    logger.error('Remove student skill error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get student's languages from M2M
 */
async function getStudentLanguages(req, res) {
  try {
    const studentId = req.user?.id;
    
    if (!studentId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const [languages] = await pool.execute(
      `SELECT l.language_id, l.language_name
       FROM tbl_cp_m2m_std_lng m
       JOIN tbl_cp_mlanguages l ON m.language_id = l.language_id
       WHERE m.student_id = ?
       ORDER BY l.language_name`,
      [studentId]
    );
    
    res.json({ languages });
  } catch (err) {
    logger.error('Get student languages error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getDashboardData,
  getStudentProfile,
  updateStudentProfile,
  updateStudentAddress,
  getStudentSkills,
  addStudentSkill,
  removeStudentSkill,
  getStudentLanguages
};
