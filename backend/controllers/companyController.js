// MIGRATED TO campus6 schema - Company master data management
// Changed: Removed spoc_*, simplified structure, drives now via JDs

const { pool } = require('../config/db');
const logger = require('../utils/logger');

/**
 * Get all companies with pagination and filtering
 * Companies are master data in tbl_cp_mcompany
 */
async function getCompanies(req, res) {
  try {
    const { limit = 20, offset = 0, is_active = 1 } = req.query;
    
    let query = `
      SELECT company_id, name AS company_name, industry, website, is_active, created_at, updated_at
      FROM tbl_cp_mcompany
      WHERE is_active = ?
      ORDER BY company_name ASC LIMIT ? OFFSET ?
    `;
    
    const isActive = is_active === 'true' || is_active == 1 ? 1 : 0;
    const values = [isActive, (parseInt(limit, 10) || 20), (parseInt(offset, 10) || 0)];
    
    const [companies] = await pool.query(query, values);
    
    // Get total count
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM tbl_cp_mcompany WHERE is_active = ?',
      [isActive]
    );
    
    res.json({
      companies,
      total: countResult[0].total,
      limit: (parseInt(limit, 10) || 20),
      offset: (parseInt(offset, 10) || 0)
    });
  } catch (err) {
    logger.error('Get companies error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get company by ID with associated JDs and recruitment drives
 */
async function getCompanyById(req, res) {
  try {
    const { id } = req.params;
    
    const [companies] = await pool.query(
      `SELECT company_id, name AS company_name, industry, website, is_active, created_at, updated_at
       FROM tbl_cp_mcompany WHERE company_id = ?`,
      [id]
    );
    
    if (!companies || companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    const company = companies[0];
    
    // Get Job Descriptions for this company
    const [jds] = await pool.query(
      `SELECT jd_id, title, description, experience_min_years, experience_max_years,
              salary_min, salary_max, currency, is_active, created_at
       FROM tbl_cp_job_description
       WHERE company_id = ? AND is_active = 1
       ORDER BY created_at DESC`,
      [id]
    );
    
    // Get recruitment drives for this company's JDs
    const jdIds = jds.map(jd => jd.jd_id);
    let drives = [];
    
    if (jdIds.length > 0) {
      const placeholders = jdIds.map(() => '?').join(',');
      const [drivesResult] = await pool.query(
        `SELECT drive_id, drive_company_name, status, start_date, end_date, created_at
         FROM tbl_cp_recruitment_drive
         WHERE jd_id IN (${placeholders})
         ORDER BY created_at DESC`,
        jdIds
      );
      drives = drivesResult;
    }
    
    res.json({
      company,
      job_descriptions: jds,
      recruitment_drives: drives
    });
  } catch (err) {
    logger.error('Get company by ID error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Create a new company (admin/tpo only)
 * Requires: company_name
 */
async function createCompany(req, res) {
  try {
    const { company_name, industry, website } = req.body;
    
    // Validation
    if (!company_name) {
      return res.status(400).json({ error: 'Company company_name is required' });
    }
    
    // Get next company_id
    const [maxIdResult] = await pool.query(
      'SELECT MAX(company_id) as max_id FROM tbl_cp_mcompany'
    );
    const nextCompanyId = (maxIdResult[0].max_id || 0) + 1;
    
    // Insert company
    await pool.query(
      `INSERT INTO tbl_cp_mcompany (company_id, name, industry, website, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, NOW(), NOW())`,
      [nextCompanyId, company_name, industry || null, website || null]
    );
    
    logger.info(`Company ${nextCompanyId} created by user ${req.user ? (req.user.id || req.user.user_id) : 'system'}`);
    
    res.status(201).json({
      message: 'Company created successfully',
      company_id: nextCompanyId
    });
  } catch (err) {
    logger.error('Create company error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update an existing company
 */
async function updateCompany(req, res) {
  try {
    const { id } = req.params;
    const { company_name, industry, website, is_active } = req.body;
    
    // Verify company exists
    const [existingCompanies] = await pool.query(
      'SELECT company_id FROM tbl_cp_mcompany WHERE company_id = ?',
      [id]
    );
    
    if (existingCompanies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    // Build dynamic update query
    const updates = [];
    const values = [];
    
    if (company_name !== undefined) {
      updates.push('name = ?');
      values.push(company_name);
    }
    
    if (industry !== undefined) {
      updates.push('industry = ?');
      values.push(industry);
    }
    
    if (website !== undefined) {
      updates.push('website = ?');
      values.push(website);
    }
    
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(id);
    updates.push('updated_at = NOW()');
    
    await pool.query(
      `UPDATE tbl_cp_mcompany SET ${updates.join(', ')} WHERE company_id = ?`,
      values
    );
    
    logger.info(`Company ${id} updated by user ${req.user ? (req.user.id || req.user.user_id) : 'system'}`);
    
    res.json({ message: 'Company updated successfully' });
  } catch (err) {
    logger.error('Update company error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Deactivate a company (soft delete by setting is_active = 0)
 * Also deactivates all associated JDs
 */
async function deleteCompany(req, res) {
  try {
    const { id } = req.params;
    
    let conn;
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();
      
      // Verify company exists
      const [companies] = await conn.execute(
        'SELECT company_id FROM tbl_cp_mcompany WHERE company_id = ?',
        [id]
      );
      
      if (companies.length === 0) {
        await conn.rollback();
        return res.status(404).json({ error: 'Company not found' });
      }
      
      // Deactivate all JDs for this company
      await conn.execute(
        `UPDATE tbl_cp_job_description SET is_active = 0, updated_at = NOW()
         WHERE company_id = ?`,
        [id]
      );
      
      // Deactivate company
      await conn.execute(
        `UPDATE tbl_cp_mcompany SET is_active = 0, updated_at = NOW() WHERE company_id = ?`,
        [id]
      );
      
      await conn.commit();
      
      logger.info(`Company ${id} deactivated by user ${req.user ? (req.user.id || req.user.user_id) : 'system'}`);
      
      res.json({ message: 'Company deactivated successfully' });
    } finally {
      if (conn) conn.release();
    }
  } catch (err) {
    logger.error('Delete company error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get all active companies (for dropdowns, limited data)
 */
async function getActiveCompanies(req, res) {
  try {
    const [companies] = await pool.query(
      `SELECT company_id, name AS company_name
       FROM tbl_cp_mcompany
       WHERE is_active = 1
       ORDER BY company_name ASC`
    );
    
    res.json({ companies });
  } catch (err) {
    logger.error('Get active companies error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get JDs for a specific company
 */
async function getCompanyJDs(req, res) {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    // Verify company exists
    const [companies] = await pool.query(
      'SELECT company_id FROM tbl_cp_mcompany WHERE company_id = ?',
      [id]
    );
    
    if (companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    const limitNum = parseInt(limit, 10) || 20;
    const offsetNum = parseInt(offset, 10) || 0;

    const [jds] = await pool.query(
      `SELECT jd_id, title, description, experience_min_years, experience_max_years,
              salary_min, salary_max, currency, is_active, created_at
       FROM tbl_cp_job_description
       WHERE company_id = ?
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [id, limitNum, offsetNum]
    );
    
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM tbl_cp_job_description WHERE company_id = ?',
      [id]
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
      limit: limitNum,
      offset: offsetNum
    });
  } catch (err) {
    logger.error('Get company JDs error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getActiveCompanies,
  getCompanyJDs
};
