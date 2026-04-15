/**
 * MIGRATED TO campus6 schema
 * Updated: tbl_cp_jd_round_config (round_config_id, jd_id, round_number, round_name, round_type, config_json, is_active)
 * Updated: tbl_cp_m2m_jd_round_module (m2m_jd_round_module_id, round_config_id, module_id, is_active)
 */

const { pool } = require('../config/db');
const logger = require('../utils/logger');

/**
 * Get all rounds for a specific job description
 * Each JD can have multiple rounds (technical, interview, aptitude, etc.) configured
 */
async function getJDRounds(req, res) {
  try {
    const { jdId } = req.params;

    // Validate jdId
    if (!jdId) {
      return res.status(400).json({ error: 'JD ID is required' });
    }

    // Fetch all rounds for the JD
    const [rounds] = await pool.execute(
      `SELECT 
        rc.round_config_id,
        rc.jd_id,
        rc.round_number,
        rc.round_name,
        rc.round_type,
        rc.config_json,
        rc.is_active,
        rc.created_at,
        rc.updated_at
       FROM tbl_cp_jd_round_config rc
       WHERE rc.jd_id = ? AND rc.is_active = 1
       ORDER BY rc.round_number ASC`,
      [jdId]
    );

    // For each round, fetch the modules assigned to it
    const roundsWithModules = await Promise.all(
      rounds.map(async (round) => {
        const [modules] = await pool.execute(
          `SELECT 
            m.module_id,
            m.module_name,
            m.description
           FROM tbl_cp_m2m_jd_round_module jrm
           JOIN tbl_cp_mmodule m ON jrm.module_id = m.module_id
           WHERE jrm.round_config_id = ? AND jrm.is_active = 1
           ORDER BY m.module_name ASC`,
          [round.round_config_id]
        );

        return {
          ...round,
          config_json: round.config_json ? JSON.parse(round.config_json) : {},
          modules
        };
      })
    );

    res.json({
      success: true,
      rounds: roundsWithModules
    });
  } catch (err) {
    logger.error('Get JD rounds error:', err);
    res.status(500).json({ error: 'Failed to fetch rounds', details: err.message });
  }
}

/**
 * Get specific round configuration by ID
 */
async function getRoundById(req, res) {
  try {
    const { roundId } = req.params;

    // Fetch round config
    const [roundRows] = await pool.execute(
      `SELECT * FROM tbl_cp_jd_round_config WHERE round_config_id = ? AND is_active = 1`,
      [roundId]
    );

    if (roundRows.length === 0) {
      return res.status(404).json({ error: 'Round not found' });
    }

    const round = roundRows[0];

    // Fetch modules for this round
    const [modules] = await pool.execute(
      `SELECT 
        m.module_id,
        m.module_name,
        m.description
       FROM tbl_cp_m2m_jd_round_module jrm
       JOIN tbl_cp_mmodule m ON jrm.module_id = m.module_id
       WHERE jrm.round_config_id = ? AND jrm.is_active = 1
       ORDER BY m.module_name ASC`,
      [roundId]
    );

    res.json({
      success: true,
      round: {
        ...round,
        config_json: round.config_json ? JSON.parse(round.config_json) : {},
        modules
      }
    });
  } catch (err) {
    logger.error('Get round by ID error:', err);
    res.status(500).json({ error: 'Failed to fetch round', details: err.message });
  }
}

/**
 * Create a new round for a JD
 * This replaces the old table-based approach with config-based approach
 */
async function createRound(req, res) {
  const conn = await pool.getConnection();
  try {
    const { jdId } = req.params;
    const { round_number, round_name, round_type, config_json = {}, module_ids = [] } = req.body;

    // Validation
    if (!jdId || !round_number || !round_name || !round_type) {
      return res.status(400).json({
        error: 'Missing required fields: jdId, round_number, round_name, round_type'
      });
    }

    // Validate round_type enum
    const VALID_ROUND_TYPES = ['aptitude', 'technical_interview', 'hr_interview', 'group_discussion', 'coding_challenge'];
    if (!VALID_ROUND_TYPES.includes(round_type)) {
      return res.status(400).json({
        error: `Invalid round_type. Must be one of: ${VALID_ROUND_TYPES.join(', ')}`
      });
    }

    await conn.beginTransaction();

    // 1. Check if JD exists
    const [jdRows] = await conn.execute(
      'SELECT jd_id FROM tbl_cp_job_description WHERE jd_id = ? AND is_active = 1',
      [jdId]
    );
    if (jdRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Job description not found or inactive' });
    }

    // 2. Check if round number already exists for this JD
    const [existingRounds] = await conn.execute(
      'SELECT round_config_id FROM tbl_cp_jd_round_config WHERE jd_id = ? AND round_number = ?',
      [jdId, round_number]
    );
    if (existingRounds.length > 0) {
      await conn.rollback();
      return res.status(400).json({ error: 'Round number already exists for this JD' });
    }

    // 3. Insert new round config
    const configJsonStr = typeof config_json === 'string' ? config_json : JSON.stringify(config_json);
    const [insertResult] = await conn.execute(
      `INSERT INTO tbl_cp_jd_round_config 
       (round_config_id, jd_id, round_number, round_name, round_type, config_json, is_active, created_at, updated_at)
       VALUES (UUID(), ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [jdId, round_number, round_name, round_type, configJsonStr]
    );

    // Get the inserted round_config_id
    const [newRound] = await conn.execute(
      'SELECT round_config_id FROM tbl_cp_jd_round_config WHERE jd_id = ? AND round_number = ? ORDER BY created_at DESC LIMIT 1',
      [jdId, round_number]
    );
    const roundConfigId = newRound[0]?.round_config_id;

    // 4. Add modules to this round (if provided)
    if (Array.isArray(module_ids) && module_ids.length > 0) {
      // Verify all module IDs exist
      const [modules] = await conn.execute(
        `SELECT module_id FROM tbl_cp_mmodule WHERE module_id IN (${module_ids.map(() => '?').join(',')})`,
        module_ids
      );
      if (modules.length !== module_ids.length) {
        await conn.rollback();
        return res.status(400).json({ error: 'One or more modules not found' });
      }

      // Insert M2M records
      const m2mValues = module_ids.map(moduleId => [
        uuid(),
        roundConfigId,
        moduleId,
        1  // is_active
      ]);
      await conn.query(
        'INSERT INTO tbl_cp_m2m_jd_round_module (m2m_jd_round_module_id, round_config_id, module_id, is_active) VALUES ?',
        [m2mValues]
      );
    }

    await conn.commit();

    res.status(201).json({
      success: true,
      message: 'Round created successfully',
      round_config_id: roundConfigId
    });
  } catch (err) {
    await conn.rollback();
    logger.error('Create round error:', err);
    res.status(500).json({ error: 'Failed to create round', details: err.message });
  } finally {
    conn.release();
  }
}

/**
 * Update an existing round config
 */
async function updateRound(req, res) {
  const conn = await pool.getConnection();
  try {
    const { roundId } = req.params;
    const { round_name, round_type, config_json, module_ids } = req.body;

    if (!roundId) {
      return res.status(400).json({ error: 'Round ID is required' });
    }

    await conn.beginTransaction();

    // 1. Verify round exists
    const [roundRows] = await conn.execute(
      'SELECT * FROM tbl_cp_jd_round_config WHERE round_config_id = ? AND is_active = 1',
      [roundId]
    );
    if (roundRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Round not found' });
    }

    // 2. Update round config
    const updateFields = [];
    const updateValues = [];
    if (round_name !== undefined) {
      updateFields.push('round_name = ?');
      updateValues.push(round_name);
    }
    if (round_type !== undefined) {
      const VALID_ROUND_TYPES = ['aptitude', 'technical_interview', 'hr_interview', 'group_discussion', 'coding_challenge'];
      if (!VALID_ROUND_TYPES.includes(round_type)) {
        await conn.rollback();
        return res.status(400).json({
          error: `Invalid round_type. Must be one of: ${VALID_ROUND_TYPES.join(', ')}`
        });
      }
      updateFields.push('round_type = ?');
      updateValues.push(round_type);
    }
    if (config_json !== undefined) {
      updateFields.push('config_json = ?');
      const configJsonStr = typeof config_json === 'string' ? config_json : JSON.stringify(config_json);
      updateValues.push(configJsonStr);
    }

    updateFields.push('updated_at = NOW()');
    if (updateFields.length > 1) { // More than just updated_at
      updateValues.push(roundId);
      await conn.execute(
        `UPDATE tbl_cp_jd_round_config SET ${updateFields.join(', ')} WHERE round_config_id = ?`,
        updateValues
      );
    }

    // 3. Update modules (if provided)
    if (Array.isArray(module_ids)) {
      // Delete existing m2m records for this round
      await conn.execute(
        'DELETE FROM tbl_cp_m2m_jd_round_module WHERE round_config_id = ?',
        [roundId]
      );

      // Add new m2m records
      if (module_ids.length > 0) {
        const [modules] = await conn.execute(
          `SELECT module_id FROM tbl_cp_mmodule WHERE module_id IN (${module_ids.map(() => '?').join(',')})`,
          module_ids
        );
        if (modules.length !== module_ids.length) {
          await conn.rollback();
          return res.status(400).json({ error: 'One or more modules not found' });
        }

        const m2mValues = module_ids.map(moduleId => [
          uuid(),
          roundId,
          moduleId,
          1  // is_active
        ]);
        await conn.query(
          'INSERT INTO tbl_cp_m2m_jd_round_module (m2m_jd_round_module_id, round_config_id, module_id, is_active) VALUES ?',
          [m2mValues]
        );
      }
    }

    await conn.commit();

    res.json({
      success: true,
      message: 'Round updated successfully'
    });
  } catch (err) {
    await conn.rollback();
    logger.error('Update round error:', err);
    res.status(500).json({ error: 'Failed to update round', details: err.message });
  } finally {
    conn.release();
  }
}

/**
 * Soft delete a round (set is_active = 0)
 */
async function deleteRound(req, res) {
  try {
    const { roundId } = req.params;

    if (!roundId) {
      return res.status(400).json({ error: 'Round ID is required' });
    }

    const [result] = await pool.execute(
      'UPDATE tbl_cp_jd_round_config SET is_active = 0, updated_at = NOW() WHERE round_config_id = ? AND is_active = 1',
      [roundId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Round not found or already deleted' });
    }

    res.json({
      success: true,
      message: 'Round deleted successfully'
    });
  } catch (err) {
    logger.error('Delete round error:', err);
    res.status(500).json({ error: 'Failed to delete round', details: err.message });
  }
}

/**
 * Add a module to a round
 */
async function addModuleToRound(req, res) {
  try {
    const { roundId } = req.params;
    const { module_id } = req.body;

    if (!roundId || !module_id) {
      return res.status(400).json({ error: 'Round ID and module_id are required' });
    }

    // Verify round exists
    const [roundRows] = await pool.execute(
      'SELECT round_config_id FROM tbl_cp_jd_round_config WHERE round_config_id = ? AND is_active = 1',
      [roundId]
    );
    if (roundRows.length === 0) {
      return res.status(404).json({ error: 'Round not found' });
    }

    // Verify module exists
    const [moduleRows] = await pool.execute(
      'SELECT module_id FROM tbl_cp_mmodule WHERE module_id = ? AND is_active = 1',
      [module_id]
    );
    if (moduleRows.length === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }

    // Check if already associated
    const [existingRows] = await pool.execute(
      'SELECT m2m_jd_round_module_id FROM tbl_cp_m2m_jd_round_module WHERE round_config_id = ? AND module_id = ?',
      [roundId, module_id]
    );
    if (existingRows.length > 0) {
      return res.status(400).json({ error: 'Module already associated with this round' });
    }

    // Generate UUID for m2m record
    const { v4: uuid } = require('uuid');
    const m2mId = uuid();

    // Insert M2M record
    await pool.execute(
      'INSERT INTO tbl_cp_m2m_jd_round_module (m2m_jd_round_module_id, round_config_id, module_id, is_active) VALUES (?, ?, ?, 1)',
      [m2mId, roundId, module_id]
    );

    res.status(201).json({
      success: true,
      message: 'Module added to round successfully'
    });
  } catch (err) {
    logger.error('Add module to round error:', err);
    res.status(500).json({ error: 'Failed to add module', details: err.message });
  }
}

/**
 * Remove a module from a round
 */
async function removeModuleFromRound(req, res) {
  try {
    const { roundId, moduleId } = req.params;

    if (!roundId || !moduleId) {
      return res.status(400).json({ error: 'Round ID and module ID are required' });
    }

    const [result] = await pool.execute(
      'DELETE FROM tbl_cp_m2m_jd_round_module WHERE round_config_id = ? AND module_id = ?',
      [roundId, moduleId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Module not associated with this round' });
    }

    res.json({
      success: true,
      message: 'Module removed from round successfully'
    });
  } catch (err) {
    logger.error('Remove module from round error:', err);
    res.status(500).json({ error: 'Failed to remove module', details: err.message });
  }
}

module.exports = {
  getJDRounds,
  getRoundById,
  createRound,
  updateRound,
  deleteRound,
  addModuleToRound,
  removeModuleFromRound
};
