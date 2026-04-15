/**
 * MIGRATED TO campus6 schema
 * Updated: questionController-new.js with module_id, difficulty_id, display_order
 */

const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// Get all questions (with optional filters)
router.get('/', authenticate, questionController.getQuestions);

// Get modules (dropdown)
router.get('/modules', authenticate, questionController.getModules);

// Get difficulty levels (dropdown)
router.get('/difficulties', authenticate, questionController.getDifficultyLevels);

// Create question (admin, tpo only)
router.post('/', authenticate, requireRole(['admin', 'tpo']), questionController.createQuestion);

// Get specific question by ID (with options)
router.get('/:id', authenticate, questionController.getQuestionWithOptions);

// Update question (admin, tpo only)
router.put('/:id', authenticate, requireRole(['admin', 'tpo']), questionController.updateQuestion);

// Delete question (admin, tpo only)
router.delete('/:id', authenticate, requireRole(['admin', 'tpo']), questionController.deleteQuestion);

module.exports = router;
