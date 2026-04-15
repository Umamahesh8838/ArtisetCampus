// MIGRATED TO campus6 schema - Job Description management
// Changed: Removed drive_id, Added company_id FK, Updated column names, Added salary constraints

const { pool } = require('../config/db');
const logger = require('../utils/logger');

/**
 * Get all job descriptions with company info
 * Filters by is_active = 1
 */
async function getJDs(req, res) {
  try {
    const { limit = 50, offset = 0, company_id } = req.query;
    
    let query = `
      SELECT j.jd_id, j.title, j.description, j.company_id, c.name AS company_name,
             j.experience_min_years, j.experience_max_years, j.salary_min, j.salary_max, j.currency,
             j.is_active, j.created_date, j.updated_date
      FROM tbl_cp_job_description j
      LEFT JOIN tbl_cp_mcompany c ON j.company_id = c.company_id
      WHERE j.is_active = 1
    `;
    
    const values = [];
    
    if (company_id) {
      query += ' AND j.company_id = ?';
      values.push(company_id);
    }
    
    query += ' ORDER BY j.created_date DESC LIMIT ? OFFSET ?';
    values.push((parseInt(limit, 10) || 20), (parseInt(offset, 10) || 0));
    
    const [jds] = await pool.query(query, values);
    
    // Parse JSON fields
    const processedJds = jds.map(jd => ({
      ...jd,
      skills_required: jd.skills_required ? JSON.parse(jd.skills_required) : [],
      benefits: jd.benefits ? JSON.parse(jd.benefits) : []
    }));
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM tbl_cp_job_description WHERE is_active = 1';
    const countVals = [];
    
    if (company_id) {
      countQuery += ' AND company_id = ?';
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
      `SELECT j.*, c.name AS company_name
       FROM tbl_cp_job_description j
       LEFT JOIN tbl_cp_mcompany c ON j.company_id = c.company_id
       WHERE j.jd_id = ?`,
      [id]
    );
    
    if (jds.length === 0) {
      return res.status(404).json({ error: 'JD not found' });
    }
    
    const jd = jds[0];
    
    // Parse JSON fields
    jd.skills_required = jd.skills_required ? JSON.parse(jd.skills_required) : [];
    jd.benefits = jd.benefits ? JSON.parse(jd.benefits) : [];
    
    // Get recruitment drives using this JD
    const [drives] = await pool.query(
      `SELECT drive_id, drive_name, status, start_date, end_date
       FROM tbl_cp_recruitment_drive
       WHERE jd_id = ?
       ORDER BY created_date DESC`,
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
      title,
      description,
      experience_min_years,
      experience_max_years,
      salary_min,
      salary_max,
      currency = 'INR',
      skills_required = [],
      benefits = []
    } = req.body;
    
    // Validation
    if (!company_id || !title) {
      return res.status(400).json({
        error: 'Missing required fields: company_id, title'
      });
    }
    
    // Validate experience range
    if (experience_min_years && experience_max_years) {
      if (experience_min_years > experience_max_years) {
        return res.status(400).json({
          error: 'experience_min_years must be <= experience_max_years'
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
       (jd_id, company_id, title, description, experience_min_years, experience_max_years,
        salary_min, salary_max, currency, skills_required, benefits, is_active, created_date, updated_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [
        nextJdId,
        company_id,
        title,
        description || null,
        experience_min_years || null,
        experience_max_years || null,
        salary_min || null,
        salary_max || null,
        currency,
        JSON.stringify(skills_required),
        JSON.stringify(benefits)
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
      title,
      description,
      experience_min_years,
      experience_max_years,
      salary_min,
      salary_max,
      currency,
      skills_required,
      benefits,
      is_active
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
    
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    
    if (experience_min_years !== undefined) {
      updates.push('experience_min_years = ?');
      values.push(experience_min_years);
    }
    
    if (experience_max_years !== undefined) {
      updates.push('experience_max_years = ?');
      values.push(experience_max_years);
    }
    
    if (salary_min !== undefined) {
      updates.push('salary_min = ?');
      values.push(salary_min);
    }
    
    if (salary_max !== undefined) {
      updates.push('salary_max = ?');
      values.push(salary_max);
    }
    
    if (currency !== undefined) {
      updates.push('currency = ?');
      values.push(currency);
    }
    
    if (skills_required !== undefined) {
      updates.push('skills_required = ?');
      values.push(JSON.stringify(skills_required));
    }
    
    if (benefits !== undefined) {
      updates.push('benefits = ?');
      values.push(JSON.stringify(benefits));
    }
    
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    // Validate ranges if both provided
    if (experience_min_years && experience_max_years) {
      if (experience_min_years > experience_max_years) {
        return res.status(400).json({
          error: 'experience_min_years must be <= experience_max_years'
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
    updates.push('updated_date = NOW()');
    
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
      `UPDATE tbl_cp_job_description SET is_active = 0, updated_date = NOW() WHERE jd_id = ?`,
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
      `SELECT jd_id, title, description, experience_min_years, experience_max_years,
              salary_min, salary_max, currency, is_active, created_date
       FROM tbl_cp_job_description
       WHERE company_id = ?
       ORDER BY created_date DESC LIMIT ? OFFSET ?`,
      [company_id, (parseInt(limit, 10) || 20), (parseInt(offset, 10) || 0)]
    );
    
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM tbl_cp_job_description WHERE company_id = ?',
      [company_id]
    );
    
    // Parse JSON fields
    const processedJds = jds.map(jd => ({
      ...jd,
      skills_required: jd.skills_required ? JSON.parse(jd.skills_required) : [],
      benefits: jd.benefits ? JSON.parse(jd.benefits) : []
    }));
    
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
