const logger = require('../utils/logger');

/**
 * Company Controller - Company management, recruiter onboarding
 */

// Get all companies (with role-based filtering)
async function getCompanies(req, res) {
  try {
    const { limit = 20, offset = 0, is_active = 1 } = req.query;
    const { pool } = require('../config/db');

    let query = `SELECT company_id, company_name, headquarters, industry, company_size, 
                        website, logo_url, spoc_name, spoc_email, is_active, created_at
                 FROM tbl_cp_mcompany WHERE is_active = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const values = [is_active, parseInt(limit), parseInt(offset)];

    const [companies] = await pool.execute(query, values);

    // Get total count
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM tbl_cp_mcompany WHERE is_active = ?',
      [is_active]
    );

    res.json({
      companies,
      total: countResult[0].total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (err) {
    logger.error('Get companies error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get company by ID
async function getCompanyById(req, res) {
  try {
    const { id } = req.params;
    const { pool } = require('../config/db');

    const [companies] = await pool.execute(
      `SELECT company_id, company_name, headquarters, industry, company_size,
              website, logo_url, description, spoc_name, spoc_email, spoc_phone,
              spoc_user_id, is_active, created_at, updated_at
       FROM tbl_cp_mcompany WHERE company_id = ?`,
      [id]
    );

    if (!companies || companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const company = companies[0];

    // Get recruitment drives for this company
    const [drives] = await pool.execute(
      `SELECT drive_id, drive_name, status, drive_start_date, drive_end_date
       FROM tbl_cp_recruitment_drive WHERE company_id = ? ORDER BY created_at DESC`,
      [id]
    );

    res.json({
      company,
      recruitment_drives: drives,
    });
  } catch (err) {
    logger.error('Get company by ID error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Create new company (admin, TPO, recruiter)
async function createCompany(req, res) {
  try {
    const { company_name, headquarters, industry, company_size, website, logo_url, description, spoc_name, spoc_email, spoc_phone } = req.body;
    const { pool } = require('../config/db');

    if (!company_name) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    if (!spoc_email) {
      return res.status(400).json({ error: 'SPOC email is required' });
    }

    // Get next company ID
    const [maxId] = await pool.execute(
      'SELECT MAX(company_id) as maxId FROM tbl_cp_mcompany'
    );
    const companyId = (maxId[0].maxId || 0) + 1;

    const [result] = await pool.execute(
      `INSERT INTO tbl_cp_mcompany 
       (company_id, company_name, headquarters, industry, company_size, website, logo_url, description, 
        spoc_name, spoc_email, spoc_phone, spoc_user_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [companyId, company_name, headquarters, industry, company_size, website, logo_url, description, 
       spoc_name, spoc_email, spoc_phone, req.user.id]
    );

    logger.info(`Company created: ${companyId} by user ${req.user.id}`);

    res.status(201).json({
      message: 'Company created successfully',
      company_id: companyId,
    });
  } catch (err) {
    logger.error('Create company error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Update company (admin, company SPOC)
async function updateCompany(req, res) {
  try {
    const { id } = req.params;
    const { company_name, headquarters, industry, company_size, website, logo_url, description, spoc_name, spoc_email, spoc_phone, is_active } = req.body;
    const { pool } = require('../config/db');

    // Check authorization - only admin or company SPOC can update
    const [companies] = await pool.execute(
      'SELECT spoc_user_id FROM tbl_cp_mcompany WHERE company_id = ?',
      [id]
    );

    if (!companies || companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    if (req.user.role !== 'admin' && companies[0].spoc_user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized - only admin or SPOC can update' });
    }

    const updates = [];
    const values = [];

    if (company_name !== undefined) {
      updates.push('company_name = ?');
      values.push(company_name);
    }
    if (headquarters !== undefined) {
      updates.push('headquarters = ?');
      values.push(headquarters);
    }
    if (industry !== undefined) {
      updates.push('industry = ?');
      values.push(industry);
    }
    if (company_size !== undefined) {
      updates.push('company_size = ?');
      values.push(company_size);
    }
    if (website !== undefined) {
      updates.push('website = ?');
      values.push(website);
    }
    if (logo_url !== undefined) {
      updates.push('logo_url = ?');
      values.push(logo_url);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (spoc_name !== undefined) {
      updates.push('spoc_name = ?');
      values.push(spoc_name);
    }
    if (spoc_email !== undefined) {
      updates.push('spoc_email = ?');
      values.push(spoc_email);
    }
    if (spoc_phone !== undefined) {
      updates.push('spoc_phone = ?');
      values.push(spoc_phone);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    await pool.execute(
      `UPDATE tbl_cp_mcompany SET ${updates.join(', ')}, updated_at = NOW() WHERE company_id = ?`,
      values
    );

    logger.info(`Company ${id} updated by user ${req.user.id}`);

    res.json({ message: 'Company updated successfully' });
  } catch (err) {
    logger.error('Update company error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Delete company (admin only, soft delete)
async function deleteCompany(req, res) {
  try {
    const { id } = req.params;
    const { pool } = require('../config/db');

    const [companies] = await pool.execute(
      'SELECT company_id FROM tbl_cp_mcompany WHERE company_id = ?',
      [id]
    );

    if (!companies || companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    await pool.execute(
      'UPDATE tbl_cp_mcompany SET is_active = 0 WHERE company_id = ?',
      [id]
    );

    logger.info(`Company ${id} deleted by user ${req.user.id}`);

    res.json({ message: 'Company deleted successfully' });
  } catch (err) {
    logger.error('Delete company error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get company recruitment drives
async function getCompanyDrives(req, res) {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    const { pool } = require('../config/db');

    // Verify company exists
    const [companies] = await pool.execute(
      'SELECT company_id FROM tbl_cp_mcompany WHERE company_id = ?',
      [id]
    );

    if (!companies || companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const [drives] = await pool.execute(
      `SELECT drive_id, drive_name, status, drive_start_date, drive_end_date, description, created_at
       FROM tbl_cp_recruitment_drive WHERE company_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [id, parseInt(limit), parseInt(offset)]
    );

    // Get count
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM tbl_cp_recruitment_drive WHERE company_id = ?',
      [id]
    );

    res.json({
      drives,
      total: countResult[0].total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (err) {
    logger.error('Get company drives error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyDrives,
};
