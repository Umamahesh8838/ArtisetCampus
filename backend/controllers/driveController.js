// MIGRATED TO campus6 schema - Recruitment drive management
// Changed: Removed company_id, Changed is_active → status ENUM, Updated column names

const { pool } = require('../config/db');
const logger = require('../utils/logger');

/**
 * Get list of recruitment drives with pagination and status filtering
 * Status values: 'Draft', 'Active', 'Closed', 'Archived'
 */
async function getDrives(req, res) {
  try {
    const { limit = 20, offset = 0, status } = req.query;
    let query = `
      SELECT d.drive_id, d.drive_name, d.jd_id, d.start_date as drive_start_date, d.end_date as drive_end_date, d.status,
             d.created_at, d.updated_at, jd.title as jd_title, c.name as company_name
      FROM tbl_cp_recruitment_drive d
      LEFT JOIN tbl_cp_job_description jd ON d.jd_id = jd.jd_id
      LEFT JOIN tbl_cp_mcompany c ON jd.company_id = c.company_id
    `;

    const values = [];

    // Filter by status if provided
    if (status) {
      query += ' WHERE d.status = ?';
      values.push(status);
    }

    query += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
    values.push((parseInt(limit, 10) || 20), (parseInt(offset, 10) || 0));
    
    // Execute main query
    const [drives] = await pool.query(query, values);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM tbl_cp_recruitment_drive d';
    const countVals = [];
    
    if (status) {
      countQuery += ' WHERE d.status = ?';
      countVals.push(status);
    }
    
    const [countResult] = await pool.query(countQuery, countVals);
    
    res.json({
      drives,
      total: countResult[0].total,
      limit: (parseInt(limit, 10) || 20),
      offset: (parseInt(offset, 10) || 0)
    });
  } catch (err) {
    logger.error('Get drives error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get a single drive by ID with associated JD and company info
 */
async function getDriveById(req, res) {
  try {
    const { id } = req.params;
    
    const [drives] = await pool.query(
      `SELECT d.drive_id, d.drive_name, d.jd_id, d.start_date, d.end_date, d.status, d.created_date, d.updated_date
       FROM tbl_cp_recruitment_drive d
       WHERE d.drive_id = ?`,
      [id]
    );
    
    if (!drives || drives.length === 0) {
      return res.status(404).json({ error: 'Drive not found' });
    }
    
    const drive = drives[0];
    
    // Fetch associated JD info
    const [jdRows] = await pool.query(
      `SELECT j.jd_id, j.title, j.description, j.company_id, c.name AS company_name
       FROM tbl_cp_job_description j
       LEFT JOIN tbl_cp_mcompany c ON j.company_id = c.company_id
       WHERE j.jd_id = ?`,
      [drive.jd_id]
    );
    
    const jd = jdRows.length > 0 ? jdRows[0] : null;
    
    // Fetch drive rounds if exists
    const [rounds] = await pool.query(
      `SELECT dr.*, r.round_label
       FROM tbl_cp_recruitment_drive_round dr
       LEFT JOIN tbl_cp_jd_round_config r ON dr.round_config_id = r.round_config_id
       WHERE dr.drive_id = ?
       ORDER BY r.round_number`,
      [id]
    );
    
    res.json({ drive, jd, rounds });
  } catch (err) {
    logger.error('Get drive by ID error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Create a new recruitment drive
 * Requires: drive_name, jd_id, start_date, end_date
 */
async function createDrive(req, res) {
  try {
    const { drive_name, jd_id, start_date, end_date, status = 'Draft' } = req.body;
    
    // Validation
    if (!drive_name || !jd_id || !start_date || !end_date) {
      return res.status(400).json({ 
        error: 'Missing required fields: drive_name, jd_id, start_date, end_date' 
      });
    }
    
    // Verify JD exists
    const [jdRows] = await pool.query(
      'SELECT jd_id FROM tbl_cp_job_description WHERE jd_id = ?',
      [jd_id]
    );
    
    if (jdRows.length === 0) {
      return res.status(400).json({ error: 'JD not found' });
    }
    
    // Validate date range
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (startDate >= endDate) {
      return res.status(400).json({ error: 'Start date must be before end date' });
    }
    
    // Validate status ENUM
    const validStatuses = ['Draft', 'Active', 'Closed', 'Archived'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    // Get next drive_id
    const [maxIdResult] = await pool.query(
      'SELECT MAX(drive_id) as max_id FROM tbl_cp_recruitment_drive'
    );
    const nextDriveId = (maxIdResult[0].max_id || 0) + 1;
    
    // Insert drive
    await pool.query(
      `INSERT INTO tbl_cp_recruitment_drive 
       (drive_id, drive_name, jd_id, start_date, end_date, status, created_date, updated_date)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [nextDriveId, drive_name, jd_id, start_date, end_date, status]
    );
    
    logger.info(`Drive ${nextDriveId} created by user ${(req.user.id || req.user.user_id)}`);
    res.status(201).json({ 
      message: 'Drive created successfully',
      drive_id: nextDriveId 
    });
  } catch (err) {
    logger.error('Create drive error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update an existing recruitment drive
 */
async function updateDrive(req, res) {
  try {
    const { id } = req.params;
    const { drive_name, jd_id, start_date, end_date, status } = req.body;
    
    // Verify drive exists
    const [existingDrives] = await pool.query(
      'SELECT drive_id FROM tbl_cp_recruitment_drive WHERE drive_id = ?',
      [id]
    );
    
    if (existingDrives.length === 0) {
      return res.status(404).json({ error: 'Drive not found' });
    }
    
    // Build dynamic update query
    const updates = [];
    const values = [];
    
    if (drive_name !== undefined) {
      updates.push('drive_name = ?');
      values.push(drive_name);
    }
    
    if (jd_id !== undefined) {
      // Verify new JD exists
      const [jdRows] = await pool.query(
        'SELECT jd_id FROM tbl_cp_job_description WHERE jd_id = ?',
        [jd_id]
      );
      
      if (jdRows.length === 0) {
        return res.status(400).json({ error: 'JD not found' });
      }
      
      updates.push('jd_id = ?');
      values.push(jd_id);
    }
    
    if (start_date !== undefined) {
      updates.push('start_date = ?');
      values.push(start_date);
    }
    
    if (end_date !== undefined) {
      updates.push('end_date = ?');
      values.push(end_date);
    }
    
    if (status !== undefined) {
      // Validate status ENUM
      const validStatuses = ['Draft', 'Active', 'Closed', 'Archived'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }
      
      updates.push('status = ?');
      values.push(status);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    // Validate date range if both provided
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      
      if (startDate >= endDate) {
        return res.status(400).json({ error: 'Start date must be before end date' });
      }
    }
    
    values.push(id);
    updates.push('updated_date = NOW()');
    
    await pool.query(
      `UPDATE tbl_cp_recruitment_drive SET ${updates.join(', ')} WHERE drive_id = ?`,
      values
    );
    
    logger.info(`Drive ${id} updated by user ${(req.user.id || req.user.user_id)}`);
    res.json({ message: 'Drive updated successfully' });
  } catch (err) {
    logger.error('Update drive error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Close a recruitment drive (admin/tpo only)
 * Sets status to 'Closed'
 */
async function closeDrive(req, res) {
  try {
    const { id } = req.params;
    
    // Verify drive exists
    const [drives] = await pool.query(
      'SELECT drive_id, status FROM tbl_cp_recruitment_drive WHERE drive_id = ?',
      [id]
    );
    
    if (drives.length === 0) {
      return res.status(404).json({ error: 'Drive not found' });
    }
    
    if (drives[0].status === 'Closed') {
      return res.status(400).json({ error: 'Drive is already closed' });
    }
    
    await pool.query(
      `UPDATE tbl_cp_recruitment_drive 
       SET status = 'Closed', updated_date = NOW()
       WHERE drive_id = ?`,
      [id]
    );
    
    logger.info(`Drive ${id} closed by user ${(req.user.id || req.user.user_id)}`);
    res.json({ message: 'Drive closed successfully' });
  } catch (err) {
    logger.error('Close drive error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Delete a recruitment drive (only if no applications exist)
 */
async function deleteDrive(req, res) {
  try {
    const { id } = req.params;
    
    // Check if drive has any applications
    const [applications] = await pool.query(
      'SELECT COUNT(*) as count FROM tbl_cp_application WHERE drive_id = ?',
      [id]
    );
    
    if (applications[0].count > 0) {
      return res.status(400).json({
        error: 'Cannot delete drive with existing applications. Close it instead.'
      });
    }
    
    // Set status to 'Archived' instead of hard delete
    await pool.query(
      `UPDATE tbl_cp_recruitment_drive 
       SET status = 'Archived', updated_date = NOW()
       WHERE drive_id = ?`,
      [id]
    );
    
    logger.info(`Drive ${id} archived by user ${(req.user.id || req.user.user_id)}`);
    res.json({ message: 'Drive archived successfully' });
  } catch (err) {
    logger.error('Delete drive error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get applications for a specific drive
 */
async function getDriveApplications(req, res) {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0, status } = req.query;
    
    // Verify drive exists
    const [drives] = await pool.query(
      'SELECT drive_id FROM tbl_cp_recruitment_drive WHERE drive_id = ?',
      [id]
    );
    
    if (drives.length === 0) {
      return res.status(404).json({ error: 'Drive not found' });
    }
    
    let query = `
      SELECT a.application_id, a.student_id, a.serial_no, a.status, a.application_date,
             s.first_name, s.last_name, s.email, s.contact_number
      FROM tbl_cp_application a
      JOIN tbl_cp_student s ON a.student_id = s.student_id
      WHERE a.drive_id = ?
    `;
    
    const values = [id];
    
    if (status) {
      query += ' AND a.status = ?';
      values.push(status);
    }
    
    query += ' ORDER BY a.serial_no LIMIT ? OFFSET ?';
    values.push((parseInt(limit, 10) || 20), (parseInt(offset, 10) || 0));
    
    const [applications] = await pool.query(query, values);
    
    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total FROM tbl_cp_application 
      WHERE drive_id = ?
    `;
    
    const countVals = [id];
    
    if (status) {
      countQuery += ' AND status = ?';
      countVals.push(status);
    }
    
    const [countResult] = await pool.query(countQuery, countVals);
    
    res.json({
      applications,
      total: countResult[0].total,
      limit: (parseInt(limit, 10) || 20),
      offset: (parseInt(offset, 10) || 0)
    });
  } catch (err) {
    logger.error('Get drive applications error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Archive a drive (soft delete - set to Archived status)
 */
async function archiveDrive(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Drive ID is required' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE tbl_cp_recruitment_drive SET status = ? WHERE drive_id = ?',
      ['Archived', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Drive not found' });
    }

    res.json({
      success: true,
      message: 'Drive archived successfully'
    });
  } catch (err) {
    logger.error('Archive drive error:', err.message);
    res.status(500).json({ error: 'Failed to archive drive' });
  }
}

module.exports = {
  getDrives,
  getDriveById,
  createDrive,
  updateDrive,
  closeDrive,
  archiveDrive,
  deleteDrive,
  getDriveApplications
};
