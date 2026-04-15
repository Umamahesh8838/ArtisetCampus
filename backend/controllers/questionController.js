// MIGRATED TO campus6 schema - Question management with modules and difficulty levels
// Now using tbl_cp_mmodule instead of tbl_cp_msubjects
// Now using tbl_cp_mdifficulty instead of direct difficulty field
// Questions now have is_active flag for filtering
// Options now have display_order for proper sequencing

const { pool } = require('../config/db');
const logger = require('../utils/logger');

// Get all questions (active only by default, with module and difficulty lookups)
async function getQuestions(req, res) {
  try {
    const { limit = 50, offset = 0, module_id, difficulty_id, is_active = 1 } = req.query;
    
    let query = `SELECT q.*, m.module_name, d.level_label as difficulty_label
                 FROM tbl_cp_mquestions q
                 LEFT JOIN tbl_cp_mmodule m ON q.module_id = m.module_id
                 LEFT JOIN tbl_cp_mdifficulty d ON q.difficulty_id = d.difficulty_id
                 WHERE 1=1`;
    
    const values = [];
    
    // Filter by active status
    if (is_active !== undefined) {
      query += ' AND q.is_active = ?';
      values.push(is_active === '1' || is_active === true ? 1 : 0);
    }
    
    if (module_id) {
      query += ' AND q.module_id = ?';
      values.push(module_id);
    }
    
    if (difficulty_id) {
      query += ' AND q.difficulty_id = ?';
      values.push(difficulty_id);
    }
    
    query += ' ORDER BY q.created_at DESC LIMIT ? OFFSET ?';
    values.push((parseInt(limit, 10) || 20), (parseInt(offset, 10) || 0));

    console.log(query, values);
    const [rows] = await pool.query(query, values);
    
    // Count total matching
    let countQuery = 'SELECT COUNT(*) as total FROM tbl_cp_mquestions WHERE 1=1';
    const countValues = [];
    
    if (is_active !== undefined) {
      countQuery += ' AND is_active = ?';
      countValues.push(is_active === '1' || is_active === true ? 1 : 0);
    }
    if (module_id) {
      countQuery += ' AND module_id = ?';
      countValues.push(module_id);
    }
    if (difficulty_id) {
      countQuery += ' AND difficulty_id = ?';
      countValues.push(difficulty_id);
    }
    
    const [countResult] = await pool.query(countQuery, countValues);
    res.json({
      questions: rows,
      total: countResult[0].total,
      limit: (parseInt(limit, 10) || 20),
      offset: (parseInt(offset, 10) || 0)
    });
  } catch (err) {
    logger.error('Get questions error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get question with its options (ordered by display_order)
async function getQuestionWithOptions(req, res) {
  try {
    const { id } = req.params;

    const [questions] = await pool.query(
      `SELECT q.*, m.module_name, d.level_label
       FROM tbl_cp_mquestions q
       LEFT JOIN tbl_cp_mmodule m ON q.module_id = m.module_id
       LEFT JOIN tbl_cp_mdifficulty d ON q.difficulty_id = d.difficulty_id
       WHERE q.question_id = ?`,
      [id]
    );

    if (!questions.length) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const [options] = await pool.query(
      `SELECT * FROM tbl_cp_m2m_question_options
       WHERE question_id = ?
       ORDER BY display_order ASC`,
      [id]
    );

    res.json({
      question: questions[0],
      options
    });
  } catch (err) {
    logger.error('Get question with options error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Create new question with options
async function createQuestion(req, res) {
  let conn;
  try {
    const { module_id, difficulty_id, question_text, question_type, correct_answer, max_marks, options } = req.body;
    
    if (!module_id || !difficulty_id || !question_text || !question_type) {
      return res.status(400).json({
        error: 'Required fields: module_id, difficulty_id, question_text, question_type'
      });
    }

    conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      // Get next question ID
      const [idResult] = await conn.execute(
        'SELECT MAX(question_id) as max_id FROM tbl_cp_mquestions'
      );
      const nextQuestionId = (idResult[0]?.max_id || 0) + 1;

      // Insert question
      const [result] = await conn.execute(
        `INSERT INTO tbl_cp_mquestions 
         (question_id, module_id, difficulty_id, question_text, question_type, correct_answer, max_marks, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [nextQuestionId, module_id, difficulty_id, question_text, question_type, correct_answer || null, max_marks || 1.0, 1]
      );

      // Insert options with display_order
      if (options && Array.isArray(options)) {
        for (let i = 0; i < options.length; i++) {
          const opt = options[i];
          
          // Get next option ID
          const [optIdResult] = await conn.execute(
            'SELECT MAX(option_id) as max_id FROM tbl_cp_m2m_question_options'
          );
          const nextOptionId = (optIdResult[0]?.max_id || 0) + 1;

          await conn.execute(
            `INSERT INTO tbl_cp_m2m_question_options (option_id, question_id, option_text, is_correct, display_order)
             VALUES (?, ?, ?, ?, ?)`,
            [nextOptionId, nextQuestionId, opt.text, opt.is_correct ? 1 : 0, i + 1]
          );
        }
      }

      await conn.commit();
      
      logger.info(`Question ${nextQuestionId} created in module ${module_id}`);
      res.status(201).json({
        message: 'Question created successfully',
        question_id: nextQuestionId
      });
    } catch (err) {
      await conn.rollback();
      throw err;
    }
  } catch (err) {
    logger.error('Create question error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (conn) conn.release();
  }
}

// Update question
async function updateQuestion(req, res) {
  let conn;
  try {
    const { id } = req.params;
    const { module_id, difficulty_id, question_text, question_type, correct_answer, max_marks, is_active } = req.body;

    conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      const [questions] = await conn.execute(
        'SELECT question_id FROM tbl_cp_mquestions WHERE question_id = ?',
        [id]
      );

      if (!questions.length) {
        await conn.rollback();
        return res.status(404).json({ error: 'Question not found' });
      }

      await conn.execute(
        `UPDATE tbl_cp_mquestions
         SET module_id = COALESCE(?, module_id),
             difficulty_id = COALESCE(?, difficulty_id),
             question_text = COALESCE(?, question_text),
             question_type = COALESCE(?, question_type),
             correct_answer = COALESCE(?, correct_answer),
             max_marks = COALESCE(?, max_marks),
             is_active = COALESCE(?, is_active),
             updated_at = NOW()
         WHERE question_id = ?`,
        [module_id, difficulty_id, question_text, question_type, correct_answer, max_marks, is_active, id]
      );

      await conn.commit();

      res.json({ message: 'Question updated successfully', question_id: id });
    } catch (err) {
      await conn.rollback();
      throw err;
    }
  } catch (err) {
    logger.error('Update question error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (conn) conn.release();
  }
}

// Get all modules for dropdown
async function getModules(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT module_id, module_name, module_code FROM tbl_cp_mmodule ORDER BY module_name ASC'
    );
    res.json({ modules: rows });
  } catch (err) {
    logger.error('Get modules error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get all difficulty levels for dropdown
async function getDifficultyLevels(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT difficulty_id, level_code, level_label, score_weight FROM tbl_cp_mdifficulty ORDER BY difficulty_id ASC'
    );
    res.json({ difficulties: rows });
  } catch (err) {
    logger.error('Get difficulty levels error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Delete question and cascade options
async function deleteQuestion(req, res) {
  let conn;
  try {
    const { id } = req.params;

    conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      // Check if question exists
      const [questions] = await conn.execute(
        'SELECT question_id FROM tbl_cp_mquestions WHERE question_id = ?',
        [id]
      );

      if (!questions.length) {
        await conn.rollback();
        return res.status(404).json({ error: 'Question not found' });
      }

      // Delete options first (due to FK)
      await conn.execute(
        'DELETE FROM tbl_cp_m2m_question_options WHERE question_id = ?',
        [id]
      );

      // Delete question
      await conn.execute(
        'DELETE FROM tbl_cp_mquestions WHERE question_id = ?',
        [id]
      );

      await conn.commit();

      logger.info(`Question ${id} deleted`);
      res.json({ message: 'Question deleted successfully', question_id: id });
    } catch (err) {
      await conn.rollback();
      throw err;
    }
  } catch (err) {
    logger.error('Delete question error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (conn) conn.release();
  }
}

module.exports = {
  getQuestions,
  getQuestionWithOptions,
  createQuestion,
  updateQuestion,
  getModules,
  getDifficultyLevels,
  deleteQuestion
};
