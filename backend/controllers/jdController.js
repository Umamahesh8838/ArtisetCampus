// MIGRATED TO campus6 schema - Job Description management
// Changed: Removed drive_id, Added company_id FK, Updated column names, Added salary constraints

const { pool } = require('../config/db');
const logger = require('../utils/logger');

function normalizeJDRow(jd) {
  return {
    ...jd,
    experience_min_years: jd.experience_min_yrs ?? jd.experience_min_years ?? null,
    experience_max_years: jd.experience_max_yrs ?? jd.experience_max_years ?? null,
    created_date: jd.created_at ?? jd.created_date ?? null,
    updated_date: jd.updated_at ?? jd.updated_date ?? null,
    is_active: jd.status ? jd.status !== 'Closed' : true,
    skills_required: typeof jd.skills_required === 'string'
      ? JSON.parse(jd.skills_required)
      : (jd.skills_required || []),
    benefits: typeof jd.benefits === 'string'
      ? JSON.parse(jd.benefits)
      : (jd.benefits || []),
  };
}

/**
 * Get all job descriptions with company info
 * Filters by is_active = 1
 */
async function getJDs(req, res) {
  try {
    const { limit = 50, offset = 0, company_id } = req.query;
    
    let query = `
      SELECT j.jd_id, j.company_id, j.job_role, j.title, j.description,
             j.experience_min_yrs, j.experience_max_yrs, j.salary_min, j.salary_max,
             j.bond_months, j.location, j.employment_type, j.openings,
             j.hiring_manager_name, j.hiring_manager_email, j.status,
             j.created_at, j.updated_at,
             c.name AS company_name
      FROM tbl_cp_job_description j
      LEFT JOIN tbl_cp_mcompany c ON j.company_id = c.company_id
      WHERE 1 = 1
    `;
    
    const values = [];
    if (company_id) {
      query += ' AND j.company_id = ?';
      values.push(company_id);
    }

    query += ' ORDER BY j.created_at DESC LIMIT ? OFFSET ?';
    values.push((parseInt(limit, 10) || 20), (parseInt(offset, 10) || 0));
    
    const [jds] = await pool.query(query, values);
    
    const processedJds = jds.map(normalizeJDRow);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM tbl_cp_job_description';
    const countVals = [];
    
    if (company_id) {
      countQuery += ' WHERE company_id = ?';
      countVals.push(company_id);
    }
    
    const [countResult] = await pool.query(countQuery, countVals);
    
    res.json({
      jds: processedJds,
      total: countResult[0].total,
      limit: (parseInt(limit, 10) || 20),
      offset: (parseInt(offset, 10) || 0)
    });
  } catch (err) {
    logger.error('Get JDs error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get a single JD by ID
 */
async function getJDById(req, res) {
  try {
    const { id } = req.params;
    
    const [jds] = await pool.query(
      `SELECT j.jd_id, j.company_id, j.job_role, j.title, j.description,
              j.experience_min_yrs, j.experience_max_yrs, j.salary_min, j.salary_max,
              j.bond_months, j.location, j.employment_type, j.openings,
              j.hiring_manager_name, j.hiring_manager_email, j.status,
              j.created_at, j.updated_at, c.name AS company_name
       FROM tbl_cp_job_description j
       LEFT JOIN tbl_cp_mcompany c ON j.company_id = c.company_id
       WHERE j.jd_id = ?`,
      [id]
    );
    
    if (jds.length === 0) {
      return res.status(404).json({ error: 'JD not found' });
    }
    
    const jd = normalizeJDRow(jds[0]);
    
    // Get recruitment drives using this JD
    const [drives] = await pool.query(
      `SELECT drive_id, drive_name, status, start_date, end_date
       FROM tbl_cp_recruitment_drive
       WHERE jd_id = ?
       ORDER BY created_at DESC`,
      [id]
    );
    
    res.json({ jd, drives });
  } catch (err) {
    logger.error('Get JD by ID error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Create a new job description
 * Requires: company_id, title, experience_min_years, experience_max_years, salary_min, salary_max
 */
async function createJD(req, res) {
  try {
    const {
      company_id,
      job_role,
      title,
      description,
      experience_min_yrs,
      experience_max_yrs,
      salary_min,
      salary_max,
      bond_months = 0,
      location = 'Remote',
      employment_type = 'Full-Time',
      openings = 1,
      hiring_manager_name = 'Not Assigned',
      hiring_manager_email = 'noreply@company.com',
      status = 'Open'
    } = req.body;
    
    // Validation
    if (!company_id || !job_role || !title) {
      return res.status(400).json({
        error: 'Missing required fields: company_id, job_role, title'
      });
    }
    
    // Validate experience range
    if (experience_min_yrs !== undefined && experience_max_yrs !== undefined) {
      if (experience_min_yrs > experience_max_yrs) {
        return res.status(400).json({
          error: 'experience_min_yrs must be <= experience_max_yrs'
        });
      }
    }
    
    // Validate salary range
    if (salary_min && salary_max) {
      if (salary_min > salary_max) {
        return res.status(400).json({
          error: 'salary_min must be <= salary_max'
        });
      }
    }
    
    // Verify company exists
    const [companies] = await pool.query(
      'SELECT company_id FROM tbl_cp_mcompany WHERE company_id = ?',
      [company_id]
    );
    
    if (companies.length === 0) {
      return res.status(400).json({ error: 'Company not found' });
    }
    
    // Get next JD ID
    const [maxIdResult] = await pool.query(
      'SELECT MAX(jd_id) as max_id FROM tbl_cp_job_description'
    );
    const nextJdId = (maxIdResult[0].max_id || 0) + 1;
    
    // Insert JD
    await pool.query(
      `INSERT INTO tbl_cp_job_description
       (jd_id, company_id, job_role, title, description, experience_min_yrs, experience_max_yrs,
        salary_min, salary_max, bond_months, location, employment_type, openings,
        hiring_manager_name, hiring_manager_email, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        nextJdId,
        company_id,
        job_role,
        title,
        description || null,
        experience_min_yrs ?? null,
        experience_max_yrs ?? null,
        salary_min || null,
        salary_max || null,
        bond_months || 0,
        location,
        employment_type,
        openings || 1,
        hiring_manager_name,
        hiring_manager_email,
        status
      ]
    );
    
    logger.info(`JD ${nextJdId} created by user ${req.user ? (req.user.id || req.user.user_id) : 'system'}`);
    res.status(201).json({
      message: 'JD created successfully',
      jd_id: nextJdId
    });
  } catch (err) {
    logger.error('Create JD error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update an existing JD
 */
async function updateJD(req, res) {
  try {
    const { id } = req.params;
    const {
      company_id,
      job_role,
      title,
      description,
      experience_min_yrs,
      experience_max_yrs,
      salary_min,
      salary_max,
      bond_months,
      location,
      employment_type,
      openings,
      hiring_manager_name,
      hiring_manager_email,
      status
    } = req.body;
    
    // Verify JD exists
    const [existingJds] = await pool.query(
      'SELECT jd_id FROM tbl_cp_job_description WHERE jd_id = ?',
      [id]
    );
    
    if (existingJds.length === 0) {
      return res.status(404).json({ error: 'JD not found' });
    }
    
    // Build dynamic update query
    const updates = [];
    const values = [];
    
    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }

    if (job_role !== undefined) {
      updates.push('job_role = ?');
      values.push(job_role);
    }

    if (company_id !== undefined) {
      const [companies] = await pool.query(
        'SELECT company_id FROM tbl_cp_mcompany WHERE company_id = ?',
        [company_id]
      );

      if (companies.length === 0) {
        return res.status(400).json({ error: 'Company not found' });
      }

      updates.push('company_id = ?');
      values.push(company_id);
    }
    
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    
    if (experience_min_yrs !== undefined) {
      updates.push('experience_min_yrs = ?');
      values.push(experience_min_yrs);
    }
    
    if (experience_max_yrs !== undefined) {
      updates.push('experience_max_yrs = ?');
      values.push(experience_max_yrs);
    }
    
    if (salary_min !== undefined) {
      updates.push('salary_min = ?');
      values.push(salary_min);
    }

    if (salary_max !== undefined) {
      updates.push('salary_max = ?');
      values.push(salary_max);
    }
    
    if (bond_months !== undefined) {
      updates.push('bond_months = ?');
      values.push(bond_months);
    }

    if (location !== undefined) {
      updates.push('location = ?');
      values.push(location);
    }

    if (employment_type !== undefined) {
      updates.push('employment_type = ?');
      values.push(employment_type);
    }

    if (openings !== undefined) {
      updates.push('openings = ?');
      values.push(openings);
    }

    if (hiring_manager_name !== undefined) {
      updates.push('hiring_manager_name = ?');
      values.push(hiring_manager_name);
    }

    if (hiring_manager_email !== undefined) {
      updates.push('hiring_manager_email = ?');
      values.push(hiring_manager_email);
    }

    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    // Validate ranges if both provided
    if (experience_min_yrs !== undefined && experience_max_yrs !== undefined) {
      if (experience_min_yrs > experience_max_yrs) {
        return res.status(400).json({
          error: 'experience_min_yrs must be <= experience_max_yrs'
        });
      }
    }
    
    if (salary_min && salary_max) {
      if (salary_min > salary_max) {
        return res.status(400).json({
          error: 'salary_min must be <= salary_max'
        });
      }
    }
    
    values.push(id);
    updates.push('updated_at = NOW()');
    
    await pool.query(
      `UPDATE tbl_cp_job_description SET ${updates.join(', ')} WHERE jd_id = ?`,
      values
    );
    
    logger.info(`JD ${id} updated by user ${req.user ? (req.user.id || req.user.user_id) : 'system'}`);
    res.json({ message: 'JD updated successfully' });
  } catch (err) {
    logger.error('Update JD error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Deactivate a JD (soft delete by setting is_active = 0)
 * Only allowed if no active recruitment drives use it
 */
async function deactivateJD(req, res) {
  try {
    const { id } = req.params;
    
    // Check for active recruitment drives using this JD
    const [activedrives] = await pool.query(
      `SELECT COUNT(*) as count FROM tbl_cp_recruitment_drive 
       WHERE jd_id = ? AND status IN ('Draft', 'Active')`,
      [id]
    );
    
    if (activedrives[0].count > 0) {
      return res.status(400).json({
        error: 'Cannot deactivate JD with active recruitment drives'
      });
    }
    
    await pool.query(
      `UPDATE tbl_cp_job_description SET status = 'Closed', updated_at = NOW() WHERE jd_id = ?`,
      [id]
    );
    
    logger.info(`JD ${id} deactivated by user ${req.user ? (req.user.id || req.user.user_id) : 'system'}`);
    res.json({ message: 'JD deactivated successfully' });
  } catch (err) {
    logger.error('Deactivate JD error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get JDs for a specific company
 */
async function getJDsForCompany(req, res) {
  try {
    const { company_id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    // Verify company exists
    const [companies] = await pool.query(
      'SELECT company_id FROM tbl_cp_mcompany WHERE company_id = ?',
      [company_id]
    );
    
    if (companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    const [jds] = await pool.query(
      `SELECT jd_id, company_id, job_role, title, description, experience_min_yrs,
              experience_max_yrs, salary_min, salary_max, bond_months, location,
              employment_type, openings, hiring_manager_name, hiring_manager_email,
              status, created_at, updated_at
       FROM tbl_cp_job_description
       WHERE company_id = ?
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [company_id, (parseInt(limit, 10) || 20), (parseInt(offset, 10) || 0)]
    );
    
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM tbl_cp_job_description WHERE company_id = ?',
      [company_id]
    );
    
    const processedJds = jds.map(normalizeJDRow);
    
    res.json({
      jds: processedJds,
      total: countResult[0].total,
      limit: (parseInt(limit, 10) || 20),
      offset: (parseInt(offset, 10) || 0)
    });
  } catch (err) {
    logger.error('Get JDs for company error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getJDs,
  getJDById,
  createJD,
  updateJD,
  deactivateJD,
  getJDsForCompany
};
