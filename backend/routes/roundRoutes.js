/**
 * MIGRATED TO campus6 schema
 * Updated: roundController-new.js with tbl_cp_jd_round_config
 * Updated: M2M relationships via tbl_cp_m2m_jd_round_module
 * Updated: Round types now include: aptitude, technical_interview, hr_interview, group_discussion, coding_challenge
 */

const express = require('express');
const router = express.Router();
const roundController = require('../controllers/roundController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// All round routes require authentication and admin/tpo role
router.use(authenticate);
router.use(requireRole(['admin', 'tpo']));

// ============================================================================
// GET ROUTES
// ============================================================================

// Get all rounds for a specific JD
router.get('/jd/:jdId', roundController.getJDRounds);

// Get specific round by ID
router.get('/:roundId', roundController.getRoundById);

// ============================================================================
// CREATE/UPDATE ROUTES
// ============================================================================

// Create new round for a JD
router.post('/jd/:jdId', roundController.createRound);

// Update round config (name, type, config_json, modules)
router.put('/:roundId', roundController.updateRound);

// Add module to round (M2M operation)
router.post('/:roundId/modules', roundController.addModuleToRound);

// Remove module from round
router.delete('/:roundId/modules/:moduleId', roundController.removeModuleFromRound);

// ============================================================================
// DELETE ROUTES
// ============================================================================

// Soft delete a round (set is_active = 0)
router.delete('/:roundId', roundController.deleteRound);

module.exports = router;
