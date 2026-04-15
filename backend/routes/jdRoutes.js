/**
 * MIGRATED TO campus6 schema
 * Updated: jdController-new.js with proper company_id references
 * Updated: JSON field support for skills_required and benefits
 * Updated: Salary and experience range constraints
 */

const express = require('express');
const router = express.Router();
const jdController = require('../controllers/jdController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// ============================================================================
// PUBLIC ROUTES - No Authentication Required
// ============================================================================

// Get all active job descriptions
router.get('/', jdController.getJDs);

// Get JD by ID
router.get('/:id', jdController.getJDById);

// Get all JDs for a specific company
router.get('/company/:companyId', jdController.getJDsForCompany);

// ============================================================================
// PROTECTED ROUTES - Admin/TPO/Recruiter Only
// ============================================================================

// Create new JD (admin, tpo, recruiter)
router.post(
  '/',
  authenticate,
  requireRole(['admin', 'tpo', 'recruiter']),
  jdController.createJD
);

// Update existing JD (admin, tpo, recruiter)
router.put(
  '/:id',
  authenticate,
  requireRole(['admin', 'tpo', 'recruiter']),
  jdController.updateJD
);

// Deactivate JD (admin, tpo, recruiter)
// Note: Cannot deactivate if active drives are using it
router.patch(
  '/:id/deactivate',
  authenticate,
  requireRole(['admin', 'tpo', 'recruiter']),
  jdController.deactivateJD
);

module.exports = router;
