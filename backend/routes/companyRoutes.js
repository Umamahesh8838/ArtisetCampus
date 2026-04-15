/**
 * MIGRATED TO campus6 schema
 * Updated: companyController-new.js with simplified master table structure
 * Removed: SPOC fields (not in new schema)
 * Updated: Cascading deactivation (company deactivate -> all JDs deactivate)
 */

const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// ============================================================================
// PUBLIC ROUTES - No Authentication Required
// ============================================================================

// Get all active companies
router.get('/', companyController.getCompanies);

// Get company by ID
router.get('/:id', companyController.getCompanyById);

// Get all JDs for a company (public view)
router.get('/:id/jds', companyController.getCompanyJDs);

// ============================================================================
// PROTECTED ROUTES - Require Authentication
// ============================================================================

// Create new company (admin, tpo, recruiter)
router.post(
  '/',
  authenticate,
  requireRole(['admin', 'tpo', 'recruiter']),
  companyController.createCompany
);

// Update company (admin, recruiter)
router.put(
  '/:id',
  authenticate,
  requireRole(['admin', 'recruiter']),
  companyController.updateCompany
);

// Deactivate company (admin only - cascades to all JDs and drives)
router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  companyController.deleteCompany
);

module.exports = router;
