// MIGRATED TO campus6 schema - Application management with new table structure
// Now using tbl_cp_application with student_id, drive_id, serial_no, application_date, status
// Removed jd_id, company_id columns - these are now in tbl_cp_recruitment_drive

const { pool } = require('../config/db');
const logger = require('../utils/logger');

// Helper function to get next serial number for a drive
async function getNextSerialNo(driveId, connection = pool) {
  const [result] = await connection.execute(
    'SELECT MAX(serial_no) as max_serial FROM tbl_cp_application WHERE drive_id = ?',
    [driveId]
  );
  return (result[0]?.max_serial || 0) + 1;
}

// Helper function to insert application status history
async function insertApplicationStatusHistory(applicationId, status, connection = pool) {
  try {
    // Get next history ID
    const [idResult] = await connection.execute(
      'SELECT MAX(history_id) as max_id FROM tbl_cp_application_status_history'
    );
    const nextHistoryId = (idResult[0]?.max_id || 0) + 1;
    
    await connection.execute(
      `INSERT INTO tbl_cp_application_status_history (history_id, application_id, status, changed_date) 
       VALUES (?, ?, ?, NOW())`,
      [nextHistoryId, applicationId, status]
    );
  } catch (err) {
    logger.warn('Failed to insert application status history:', err.message);
    // Don't fail the entire operation if history logging fails
  }
}

// Student applies to a drive
async function applyToDrive(req, res) {
  let conn;
  try {
    const studentId = (req.user.id || req.user.user_id);
    const { drive_id } = req.body;
    
    if (!drive_id) {
      return res.status(400).json({ error: 'Missing required field: drive_id' });
    }

    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 1. Verify drive exists and is active
    const [driveRows] = await conn.execute(
      'SELECT drive_id, jd_id FROM tbl_cp_recruitment_drive WHERE drive_id = ? AND status = ?',
      [drive_id, 'Active']
    );
    
    if (!driveRows.length) {
      await conn.rollback();
      return res.status(404).json({ error: 'Drive not found or inactive' });
    }

    // 2. Check if student has already applied to this drive
    const [existingApp] = await conn.execute(
      'SELECT application_id FROM tbl_cp_application WHERE student_id = ? AND drive_id = ?',
      [studentId, drive_id]
    );
    
    if (existingApp.length > 0) {
      await conn.rollback();
      return res.status(409).json({ error: 'You have already applied to this drive' });
    }

    // 3. Get next serial number for this drive
    const serialNo = await getNextSerialNo(drive_id, conn);

    // 4. Get next application ID
    const [idResult] = await conn.execute(
      'SELECT MAX(application_id) as max_id FROM tbl_cp_application'
    );
    const nextAppId = (idResult[0]?.max_id || 0) + 1;

    // 5. Insert application
    const [result] = await conn.execute(
      `INSERT INTO tbl_cp_application (application_id, student_id, drive_id, serial_no, application_date, status) 
       VALUES (?, ?, ?, ?, CURRENT_DATE, ?)`,
      [nextAppId, studentId, drive_id, serialNo, 'Applied']
    );

    // 6. Insert status history
    await insertApplicationStatusHistory(nextAppId, 'Applied', conn);

    await conn.commit();
    
    logger.info(`Application ${nextAppId} created by student ${studentId} for drive ${drive_id}`);
    res.status(201).json({ 
      message: 'Application submitted successfully', 
      application_id: nextAppId 
    });
  } catch (err) {
    if (conn) await conn.rollback();
    logger.error('Apply to drive error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (conn) conn.release();
  }
}

// Get a specific application (student can view own, admin/tpo can view any)
async function getApplicationById(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;
    
    const [rows] = await pool.query(
      'SELECT * FROM tbl_cp_application WHERE application_id = ?',
      [id]
    );
    
    if (!rows.length) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    const application = rows[0];

    // Check access: student can see own, admin/tpo can see all
    if (user.role !== 'admin' && user.role !== 'tpo' && application.student_id !== user.id) {
      return res.status(403).json({ error: 'Forbidden: cannot access this application' });
    }

    res.json({ application });
  } catch (err) {
    logger.error('Get application error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// List applications for the logged-in student
async function listStudentApplications(req, res) {
  try {
    const studentId = req.user.id || req.user.user_id;
    const { limit = 20, offset = 0 } = req.query;
    const limitNum = parseInt(limit, 10) || 20;
    const offsetNum = parseInt(offset, 10) || 0;
    
    if (!studentId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found in token' });
    }

    const [applications] = await pool.query(
      `SELECT a.*, d.drive_name, jd.title as job_title
       FROM tbl_cp_application a
       JOIN tbl_cp_recruitment_drive d ON a.drive_id = d.drive_id
       JOIN tbl_cp_job_description jd ON d.jd_id = jd.jd_id
       WHERE a.student_id = ? 
       ORDER BY a.application_date DESC 
       LIMIT ? OFFSET ?`,
      [studentId, limitNum, offsetNum]
    );

    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM tbl_cp_application WHERE student_id = ?',
      [studentId]
    );

    res.json({
      applications,
      total: countResult[0].total,
      limit: limitNum,
      offset: offsetNum
    });
  } catch (err) {
    logger.error('List student applications error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// List applications for the logged-in student
async function listStudentApplications(req, res) {
  try {
    const studentId = req.user.id || req.user.user_id;
    const { limit = 20, offset = 0 } = req.query;
    const limitNum = parseInt(limit, 10) || 20;
    const offsetNum = parseInt(offset, 10) || 0;
    
    // Explicitly fallback studentId if NaN/undefined to prevent crash
    if (!studentId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found in token' });
    }

    const [applications] = await pool.query(
      `SELECT a.*, d.drive_name, jd.title as job_title
       FROM tbl_cp_application a
       JOIN tbl_cp_recruitment_drive d ON a.drive_id = d.drive_id
       JOIN tbl_cp_job_description jd ON d.jd_id = jd.jd_id
       WHERE a.student_id = ? 
       ORDER BY a.application_date DESC 
       LIMIT ? OFFSET ?`,
      [studentId, limitNum, offsetNum]
    );
    
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM tbl_cp_application WHERE student_id = ?',
      [studentId]
    );
    
    res.json({
      applications,
      total: countResult[0].total,
      limit: limitNum,
      offset: offsetNum
    });
  } catch (err) {
    logger.error('List student applications error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Admin/TPO: list all applications (with optional filters)
async function listAllApplications(req, res) {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'tpo') {
      return res.status(403).json({ error: 'Forbidden: admin or tpo required' });
    }
    
    const { limit = 20, offset = 0, status, drive_id } = req.query;
    
    let query = `SELECT a.*, s.first_name, s.last_name, s.email, d.drive_name, jd.title as job_title
                 FROM tbl_cp_application a
                 LEFT JOIN tbl_cp_student s ON a.student_id = s.student_id
                 LEFT JOIN tbl_cp_recruitment_drive d ON a.drive_id = d.drive_id
                 LEFT JOIN tbl_cp_job_description jd ON d.jd_id = jd.jd_id
                 WHERE 1=1`;
    
    const values = [];
    
    if (status) {
      query += ' AND a.status = ?';
      values.push(status);
    }
    
    if (drive_id) {
      query += ' AND a.drive_id = ?';
      values.push(drive_id);
    }
    
    query += ' ORDER BY a.application_date DESC LIMIT ? OFFSET ?';
    values.push((parseInt(limit, 10) || 20), (parseInt(offset, 10) || 0));
    
    const [applications] = await pool.query(query, values);
    
    // Build count query
    let countQuery = 'SELECT COUNT(*) as total FROM tbl_cp_application WHERE 1=1';
    const countVals = [];
    
    if (status) {
      countQuery += ' AND status = ?';
      countVals.push(status);
    }
    
    if (drive_id) {
      countQuery += ' AND drive_id = ?';
      countVals.push(drive_id);
    }
    
    const [countResult] = await pool.query(countQuery, countVals);
    
    res.json({
      applications,
      total: countResult[0].total,
      limit: (parseInt(limit, 10) || 20),
      offset: (parseInt(offset, 10) || 0)
    });
  } catch (err) {
    logger.error('List all applications error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Update application status (admin/tpo only)
async function updateApplicationStatus(req, res) {
  let conn;
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'tpo') {
      return res.status(403).json({ error: 'Forbidden: admin or tpo required' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Get current application
    const [appRows] = await conn.execute(
      'SELECT application_id FROM tbl_cp_application WHERE application_id = ?',
      [id]
    );

    if (!appRows.length) {
      await conn.rollback();
      return res.status(404).json({ error: 'Application not found' });
    }

    // Update status
    await conn.execute(
      'UPDATE tbl_cp_application SET status = ?, updated_at = NOW() WHERE application_id = ?',
      [status, id]
    );

    // Insert status history
    await insertApplicationStatusHistory(id, status, conn);

    await conn.commit();

    res.json({ message: 'Application status updated successfully', application_id: id, status });
  } catch (err) {
    if (conn) await conn.rollback();
    logger.error('Update application status error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (conn) conn.release();
  }
}

// Get application history
async function getApplicationHistory(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;

    // Verify access
    const [appRows] = await pool.query(
      'SELECT student_id FROM tbl_cp_application WHERE application_id = ?',
      [id]
    );

    if (!appRows.length) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (user.role !== 'admin' && user.role !== 'tpo' && appRows[0].student_id !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Get history
    const [history] = await pool.query(
      'SELECT * FROM tbl_cp_application_status_history WHERE application_id = ? ORDER BY changed_date ASC',
      [id]
    );

    res.json({ history });
  } catch (err) {
    logger.error('Get application history error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  applyToDrive,
  getApplicationById,
  listStudentApplications,
  listAllApplications,
  updateApplicationStatus,
  getApplicationHistory
};
