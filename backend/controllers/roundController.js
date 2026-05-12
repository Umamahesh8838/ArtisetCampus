/**
 * MIGRATED TO campus6 schema
 * Updated: tbl_cp_jd_round_config (round_config_id, jd_id, round_number, round_label, is_exam, created_at, updated_at)
 * Updated: tbl_cp_m2m_jd_round_module (jd_round_mod_id, round_config_id, module_id, weightage, difficulty_id, is_mandatory, created_at, updated_at)
 */

const { pool } = require('../config/db');
const logger = require('../utils/logger');

async function getNextId(conn, tableName, columnName) {
  const [rows] = await conn.execute(`SELECT COALESCE(MAX(${columnName}), 0) + 1 AS next_id FROM ${tableName}`);
  return rows[0].next_id;
}

async function getTableColumns(tableName) {
  const [descRows] = await pool.execute(`DESCRIBE ${tableName}`);
  return descRows.map((r) => r.Field);
}

async function resolveDifficultyId(conn, rawValue) {
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return null;
  }

  const numeric = Number(rawValue);
  if (Number.isInteger(numeric) && numeric > 0) {
    return numeric;
  }

  const value = String(rawValue).trim();
  if (!value) return null;

  const [rows] = await conn.execute(
    `SELECT difficulty_id
     FROM tbl_cp_mdifficulty
     WHERE LOWER(level_code) = LOWER(?) OR LOWER(level_label) = LOWER(?)
     ORDER BY difficulty_id ASC
     LIMIT 1`,
    [value, value]
  );

  return rows.length ? rows[0].difficulty_id : null;
}

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

    // Inspect actual columns in the live table using DESCRIBE; more reliable
    const cols = await getTableColumns('tbl_cp_jd_round_config');
    const m2mCols = await getTableColumns('tbl_cp_m2m_jd_round_module');

    const roundNameCol = cols.includes('round_label') ? 'rc.round_label' : (cols.includes('round_name') ? 'rc.round_name' : null);
    const isActiveCol = cols.includes('is_active') ? 'rc.is_active' : null;
    const isExamCol = cols.includes('is_exam') ? 'rc.is_exam' : (cols.includes('round_type') ? 'rc.round_type' : null);
    const configJsonCol = cols.includes('config_json') ? 'rc.config_json' : null;

    if (!roundNameCol) {
      // don't fail hard — return minimal rows so UI can still show round placeholders
      const [minimalRounds] = await pool.execute(
        `SELECT rc.round_config_id, rc.jd_id, rc.round_number, rc.created_at, rc.updated_at FROM tbl_cp_jd_round_config rc WHERE rc.jd_id = ? ORDER BY rc.round_number ASC`,
        [jdId]
      );
      return res.json({ success: true, rounds: minimalRounds });
    }

    // Build select list using only existing columns
    const selectList = ['rc.round_config_id', 'rc.jd_id', 'rc.round_number', `${roundNameCol} AS round_label`];
    if (isExamCol) selectList.push(`${isExamCol} AS is_exam`);
    if (configJsonCol) selectList.push(`${configJsonCol} AS config_json`);
    selectList.push('rc.created_at', 'rc.updated_at');

    const whereClauses = ['rc.jd_id = ?'];
    if (isActiveCol) whereClauses.push(`COALESCE(${isActiveCol}, 1) = 1`);

    const sql = `SELECT ${selectList.join(',\n        ')}\n       FROM tbl_cp_jd_round_config rc\n       WHERE ${whereClauses.join(' AND ')}\n       ORDER BY rc.round_number ASC`;

    const [rounds] = await pool.execute(sql, [jdId]);

    // For each round, fetch the modules assigned to it
    const roundsWithModules = await Promise.all(
      rounds.map(async (round) => {
        const [modules] = await pool.execute(
          `SELECT 
            m.module_id,
            m.module_name,
            m.description,
            ${m2mCols.includes('weightage') ? 'jrm.weightage' : '0.1000 AS weightage'},
            ${m2mCols.includes('difficulty_id') ? 'jrm.difficulty_id' : 'NULL AS difficulty_id'},
            ${m2mCols.includes('is_mandatory') ? 'jrm.is_mandatory' : '1 AS is_mandatory'}
           FROM tbl_cp_m2m_jd_round_module jrm
           JOIN tbl_cp_mmodule m ON jrm.module_id = m.module_id
           WHERE jrm.round_config_id = ?
           ORDER BY m.module_name ASC`,
          [round.round_config_id]
        );

        // If JD round table does not store config_json (or it's empty),
        // fallback to a synced drive round config for the same jd_id + round_number.
        let resolvedConfig = round.config_json;
        if (!resolvedConfig) {
          try {
            const [driveCfgRows] = await pool.execute(
              `SELECT rr.config_json
               FROM tbl_cp_recruitment_drive_round rr
               JOIN tbl_cp_recruitment_drive d ON d.drive_id = rr.drive_id
               WHERE d.jd_id = ? AND rr.round_number = ? AND rr.config_json IS NOT NULL
               ORDER BY rr.round_id DESC
               LIMIT 1`,
              [jdId, round.round_number]
            );
            if (driveCfgRows.length > 0) {
              resolvedConfig = driveCfgRows[0].config_json;
            }
          } catch (cfgErr) {
            logger.warn('Could not resolve fallback drive config for JD round', cfgErr && cfgErr.message);
          }
        }

        let parsedConfig = {};
        if (resolvedConfig) {
          try {
            parsedConfig = typeof resolvedConfig === 'string' ? JSON.parse(resolvedConfig) : resolvedConfig;
          } catch {
            parsedConfig = {};
          }
        }

        return {
          ...round,
          round_name: round.round_label,
          config_json: parsedConfig,
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
      `SELECT * FROM tbl_cp_jd_round_config WHERE round_config_id = ?`,
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
       WHERE jrm.round_config_id = ?
       ORDER BY m.module_name ASC`,
      [roundId]
    );

    res.json({
      success: true,
      round: {
        ...round,
        round_name: round.round_label,
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
      'SELECT jd_id FROM tbl_cp_job_description WHERE jd_id = ?',
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
    const nextRoundConfigId = await getNextId(conn, 'tbl_cp_jd_round_config', 'round_config_id');
    await conn.execute(
      `INSERT INTO tbl_cp_jd_round_config 
       (round_config_id, jd_id, round_number, round_label, is_exam, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        nextRoundConfigId,
        jdId,
        round_number,
        round_name || `Round ${round_number}`,
        round_type === 'aptitude' || round_type === 'coding_challenge'
      ]
    );

    const roundConfigId = nextRoundConfigId;

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
      const nextJrmId = await getNextId(conn, 'tbl_cp_m2m_jd_round_module', 'jd_round_mod_id');
      const m2mValues = module_ids.map((moduleId, index) => [
        nextJrmId + index,
        roundConfigId,
        moduleId,
        0.1000,
        null,
        1
      ]);
      await conn.query(
        'INSERT INTO tbl_cp_m2m_jd_round_module (jd_round_mod_id, round_config_id, module_id, weightage, difficulty_id, is_mandatory) VALUES ?',
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
  // If the client sent a bulk `rounds` array, treat the URL param as a JD id
  if (Array.isArray(req.body.rounds)) {
    // delegate to bulk save handler
    return bulkSaveRoundsForJD(req, res);
  }

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
      'SELECT * FROM tbl_cp_jd_round_config WHERE round_config_id = ?',
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
      updateFields.push('round_label = ?');
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
      // config_json is no longer stored in the live round config table.
    }

    updateFields.push('updated_at = NOW()');
    if (updateFields.length > 1) {
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

        const nextJrmId = await getNextId(conn, 'tbl_cp_m2m_jd_round_module', 'jd_round_mod_id');
        const m2mValues = module_ids.map((moduleId, index) => [
          nextJrmId + index,
          roundId,
          moduleId,
          0.1000,
          null,
          1
        ]);
        await conn.query(
          'INSERT INTO tbl_cp_m2m_jd_round_module (jd_round_mod_id, round_config_id, module_id, weightage, difficulty_id, is_mandatory) VALUES ?',
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
 * Bulk-save rounds for a given JD. Expects `req.body.rounds` to be an array.
 * This implements the frontend's bulk PUT /rounds/:jdId contract without altering schema.
 */
async function bulkSaveRoundsForJD(req, res) {
  const jdId = req.params.roundId; // treated as jdId here
  const rounds = req.body.rounds;
  if (!jdId || !Array.isArray(rounds)) {
    return res.status(400).json({ error: 'JD id and rounds array are required' });
  }

  logger.info(`[bulkSaveRoundsForJD] jdId=${jdId}, incoming rounds count=${rounds.length}`);
  logger.info(`[bulkSaveRoundsForJD] incoming rounds:`, JSON.stringify(rounds, null, 2));

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const roundCols = await getTableColumns('tbl_cp_jd_round_config');
    // Inspect drive round table columns so we can upsert into it without schema changes
    const driveRoundCols = await getTableColumns('tbl_cp_recruitment_drive_round');

    // ensure JD exists
    const [jdRows] = await conn.execute('SELECT jd_id FROM tbl_cp_job_description WHERE jd_id = ?', [jdId]);
    if (jdRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Job description not found' });
    }

    // Fetch existing rounds for this JD
    const [existingRounds] = await conn.execute(
      'SELECT round_config_id, round_number FROM tbl_cp_jd_round_config WHERE jd_id = ?',
      [jdId]
    );
    logger.info(`[bulkSaveRoundsForJD] existing rounds in DB:`, JSON.stringify(existingRounds, null, 2));
    const existingRoundsByNumber = {};
    existingRounds.forEach(r => {
      existingRoundsByNumber[r.round_number] = r.round_config_id;
    });

    for (const r of rounds) {
      logger.info(`[bulkSaveRoundsForJD] Processing round:`, JSON.stringify(r, null, 2));
      
      // Normalize properties from request (frontend sends 'label', 'isExam', 'modules')
      const roundName = r.round_name !== undefined ? r.round_name : r.label;
      const isExam = r.is_exam !== undefined ? r.is_exam : r.isExam;
      const modulePayload = [];
      if (Array.isArray(r.modules)) {
        for (const m of r.modules) {
          const resolvedDifficultyId = await resolveDifficultyId(conn, m.difficulty_id || m.difficulty || null);
          modulePayload.push({
            module_id: Number(m.module_id),
            weightage: m.weightage,
            difficulty_id: resolvedDifficultyId,
            is_mandatory: m.is_mandatory !== undefined ? !!m.is_mandatory : (m.mandatory !== undefined ? !!m.mandatory : true),
          });
        }
      }
      const moduleIds = Array.isArray(r.module_ids)
        ? r.module_ids
        : modulePayload.map((m) => m.module_id);
      
      let roundConfigId = r.round_config_id;

      // If no explicit round_config_id, try to find existing by round_number
      if (!roundConfigId && r.round_number !== undefined) {
        roundConfigId = existingRoundsByNumber[r.round_number];
        if (roundConfigId) {
          logger.info(`[bulkSaveRoundsForJD] Found existing round by number ${r.round_number}: roundConfigId=${roundConfigId}`);
        }
      }

      // If still no roundConfigId, check for duplicates on jd_id + round_number before creating
      let isNewRound = false;
      if (!roundConfigId) {
        const [existingDuplicate] = await conn.execute(
          'SELECT round_config_id FROM tbl_cp_jd_round_config WHERE jd_id = ? AND round_number = ?',
          [jdId, r.round_number || 0]
        );
        logger.info(`[bulkSaveRoundsForJD] Checking for duplicate (jd_id=${jdId}, round_number=${r.round_number || 0}): found=${existingDuplicate.length > 0}`);
        
        if (existingDuplicate.length > 0) {
          // Already exists, use existing
          roundConfigId = existingDuplicate[0].round_config_id;
          logger.info(`[bulkSaveRoundsForJD] Using existing roundConfigId=${roundConfigId}`);
        } else {
          // Will create new
          isNewRound = true;
          logger.info(`[bulkSaveRoundsForJD] Will create new round`);
        }
      }

      if (roundConfigId) {
        // update existing
        logger.info(`[bulkSaveRoundsForJD] Updating existing round ${roundConfigId}`);
        const updateFields = [];
        const updateValues = [];
        if (roundName !== undefined) {
          updateFields.push('round_label = ?');
          updateValues.push(roundName);
        }
        if (r.round_type !== undefined) {
          updateFields.push('round_type = ?');
          updateValues.push(r.round_type);
        }
        if (isExam !== undefined) {
          updateFields.push('is_exam = ?');
          updateValues.push(isExam ? 1 : 0);
        }
        if (roundCols.includes('is_active')) {
          updateFields.push('is_active = 1');
        }
        updateFields.push('updated_at = NOW()');
        if (updateFields.length > 0) {
          updateValues.push(roundConfigId);
          await conn.execute(`UPDATE tbl_cp_jd_round_config SET ${updateFields.join(', ')} WHERE round_config_id = ?`, updateValues);
        }

        // modules - update module associations
        if (moduleIds) {
          await conn.execute('DELETE FROM tbl_cp_m2m_jd_round_module WHERE round_config_id = ?', [roundConfigId]);
          if (moduleIds.length > 0) {
            const [modules] = await conn.execute(`SELECT module_id FROM tbl_cp_mmodule WHERE module_id IN (${moduleIds.map(() => '?').join(',')})`, moduleIds);
            if (modules.length !== moduleIds.length) {
              await conn.rollback();
              return res.status(400).json({ error: 'One or more modules not found' });
            }
            const nextJrmId = await getNextId(conn, 'tbl_cp_m2m_jd_round_module', 'jd_round_mod_id');
            const m2mValues = moduleIds.map((moduleId, index) => {
              const meta = modulePayload.find((m) => m.module_id === moduleId) || {};
              const weight = Number(meta.weightage);
              return [
                nextJrmId + index,
                roundConfigId,
                moduleId,
                Number.isFinite(weight) ? weight : 0.1000,
                meta.difficulty_id || null,
                meta.is_mandatory === false ? 0 : 1,
              ];
            });
            await conn.query('INSERT INTO tbl_cp_m2m_jd_round_module (jd_round_mod_id, round_config_id, module_id, weightage, difficulty_id, is_mandatory) VALUES ?', [m2mValues]);
          }
        }
      } else if (isNewRound) {
        // create new round
        logger.info(`[bulkSaveRoundsForJD] Creating new round for jd_id=${jdId}`);
        const nextRoundConfigId = await getNextId(conn, 'tbl_cp_jd_round_config', 'round_config_id');
        const roundLabel = roundName || `Round ${r.round_number || 0}`;
        logger.info(`[bulkSaveRoundsForJD] Inserting: round_config_id=${nextRoundConfigId}, jd_id=${jdId}, round_number=${r.round_number || 0}, round_label=${roundLabel}`);
        const roundFields = ['round_config_id', 'jd_id', 'round_number', 'round_label', 'is_exam'];
        const roundValues = [
          nextRoundConfigId,
          jdId,
          r.round_number || 0,
          roundLabel,
          (r.round_type === 'aptitude' || r.round_type === 'coding_challenge' || isExam) ? 1 : 0,
        ];
        if (roundCols.includes('is_active')) {
          roundFields.push('is_active');
          roundValues.push(1);
        }
        roundFields.push('created_at', 'updated_at');
        await conn.execute(
          `INSERT INTO tbl_cp_jd_round_config (${roundFields.join(', ')}) VALUES (${roundFields.map((f) => (f === 'created_at' || f === 'updated_at') ? 'NOW()' : '?').join(', ')})`,
          roundValues
        );
        roundConfigId = nextRoundConfigId;
        
        // Add modules for new round
        if (moduleIds && moduleIds.length > 0) {
          const [modules] = await conn.execute(`SELECT module_id FROM tbl_cp_mmodule WHERE module_id IN (${moduleIds.map(() => '?').join(',')})`, moduleIds);
          if (modules.length !== moduleIds.length) {
            await conn.rollback();
            return res.status(400).json({ error: 'One or more modules not found' });
          }
          const nextJrmId = await getNextId(conn, 'tbl_cp_m2m_jd_round_module', 'jd_round_mod_id');
          const m2mValues = moduleIds.map((moduleId, index) => {
            const meta = modulePayload.find((m) => m.module_id === moduleId) || {};
            const weight = Number(meta.weightage);
            return [
              nextJrmId + index,
              nextRoundConfigId,
              moduleId,
              Number.isFinite(weight) ? weight : 0.1000,
              meta.difficulty_id || null,
              meta.is_mandatory === false ? 0 : 1,
            ];
          });
          await conn.query('INSERT INTO tbl_cp_m2m_jd_round_module (jd_round_mod_id, round_config_id, module_id, weightage, difficulty_id, is_mandatory) VALUES ?', [m2mValues]);
        }
      }

      // --- Sync JD round -> per-drive round rows ---
      // If the drive-specific rounds table exists, upsert a row per drive that uses this JD.
      try {
        const [drivesUsingJD] = await conn.execute('SELECT drive_id FROM tbl_cp_recruitment_drive WHERE jd_id = ?', [jdId]);
        if (Array.isArray(drivesUsingJD) && drivesUsingJD.length > 0) {
          // Prepare config_json payload (keep modules & metadata)
          const rawConfig = r.config_json || r.config || null;
          const configPayload = {
            source: 'jd',
            jd_round_config_id: roundConfigId || null,
            scheduledDate: rawConfig && rawConfig.scheduledDate ? rawConfig.scheduledDate : null,
            modules: modulePayload || [],
            original: rawConfig
          };

          for (const driveRow of drivesUsingJD) {
            const driveId = driveRow.drive_id;
            // Check existing drive round by drive_id + round_number
            const [existingDriveRound] = await conn.execute(
              'SELECT round_id FROM tbl_cp_recruitment_drive_round WHERE drive_id = ? AND round_number = ? LIMIT 1',
              [driveId, r.round_number || 0]
            );

            const configJsonStr = JSON.stringify(configPayload);

            if (existingDriveRound && existingDriveRound.length > 0) {
              const driveRoundId = existingDriveRound[0].round_id;
              // Build update fields dynamically depending on available columns
              const updates = [];
              const vals = [];
              if (driveRoundCols.includes('round_name')) {
                updates.push('round_name = ?'); vals.push(roundName || r.round_name || r.label || `Round ${r.round_number || 0}`);
              }
              if (driveRoundCols.includes('round_type') && r.round_type !== undefined) {
                updates.push('round_type = ?'); vals.push(r.round_type);
              }
              if (driveRoundCols.includes('config_json')) {
                updates.push('config_json = ?'); vals.push(configJsonStr);
              }
              if (driveRoundCols.includes('updated_at')) {
                updates.push('updated_at = NOW()');
              }
              if (updates.length > 0) {
                vals.push(driveRoundId);
                await conn.execute(`UPDATE tbl_cp_recruitment_drive_round SET ${updates.join(', ')} WHERE round_id = ?`, vals);
              }
            } else {
              // Insert new drive round
              const nextDriveRoundId = await getNextId(conn, 'tbl_cp_recruitment_drive_round', 'round_id');
              const insertFields = ['round_id', 'drive_id', 'round_number'];
              const insertVals = [nextDriveRoundId, driveId, r.round_number || 0];
              if (driveRoundCols.includes('round_name')) {
                insertFields.push('round_name'); insertVals.push(roundName || r.round_name || r.label || `Round ${r.round_number || 0}`);
              }
              if (driveRoundCols.includes('round_type')) {
                insertFields.push('round_type'); insertVals.push(r.round_type || null);
              }
              if (driveRoundCols.includes('config_json')) {
                insertFields.push('config_json'); insertVals.push(configJsonStr);
              }
              if (driveRoundCols.includes('created_at')) {
                insertFields.push('created_at');
              }
              if (driveRoundCols.includes('updated_at')) {
                insertFields.push('updated_at');
              }
              const placeholders = insertFields.map(() => '?').join(', ');
              const finalInsertVals = [...insertVals];
              if (driveRoundCols.includes('created_at')) {
                finalInsertVals.push(new Date());
              }
              if (driveRoundCols.includes('updated_at')) {
                finalInsertVals.push(new Date());
              }
              await conn.execute(
                `INSERT INTO tbl_cp_recruitment_drive_round (${insertFields.join(', ')}) VALUES (${placeholders})`,
                finalInsertVals
              );
            }
          }
        }
      } catch (syncErr) {
        // non-fatal: log and continue; admin save should not fail because drive sync failed
        logger.warn('Failed to sync JD round to drive rounds:', syncErr && syncErr.message);
      }
    }

    await conn.commit();
    res.json({ success: true, message: 'Rounds saved successfully' });
  } catch (err) {
    await conn.rollback();
    logger.error('Bulk save rounds error:', err);
    res.status(500).json({ error: 'Failed to save rounds', details: err.message });
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

    await pool.execute(
      'DELETE FROM tbl_cp_m2m_jd_round_module WHERE round_config_id = ?',
      [roundId]
    );

    const [result] = await pool.execute(
      'DELETE FROM tbl_cp_jd_round_config WHERE round_config_id = ?',
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
      'SELECT round_config_id FROM tbl_cp_jd_round_config WHERE round_config_id = ?',
      [roundId]
    );
    if (roundRows.length === 0) {
      return res.status(404).json({ error: 'Round not found' });
    }

    // Verify module exists
    const [moduleRows] = await pool.execute(
      'SELECT module_id FROM tbl_cp_mmodule WHERE module_id = ?',
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
    const m2mId = await getNextId(pool, 'tbl_cp_m2m_jd_round_module', 'jd_round_mod_id');

    // Insert M2M record
    await pool.execute(
      'INSERT INTO tbl_cp_m2m_jd_round_module (jd_round_mod_id, round_config_id, module_id, weightage, difficulty_id, is_mandatory) VALUES (?, ?, ?, 0.1000, NULL, 1)',
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
