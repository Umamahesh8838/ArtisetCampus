const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authenticate } = require('../middleware/auth');
const { requireRole, checkPermission } = require('../middleware/rbac');

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

// Get all companies (everyone can see)
router.get('/', companyController.getCompanies);

// Get company by ID
router.get('/:id', companyController.getCompanyById);

// Get recruitment drives for a company
router.get('/:id/recruitment-drives', companyController.getCompanyDrives);

// ============================================================================
// PROTECTED ROUTES - Require Authentication
// ============================================================================

// Create new company (Admin, TPO, Recruiter)
router.post(
  '/',
  authenticate,
  requireRole(['admin', 'tpo', 'recruiter']),
  companyController.createCompany
);

// Update company (Admin or company SPOC)
router.put(
  '/:id',
  authenticate,
  requireRole(['admin', 'recruiter']),
  companyController.updateCompany
);

// Delete company (Admin only)
router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  companyController.deleteCompany
);

module.exports = router;
