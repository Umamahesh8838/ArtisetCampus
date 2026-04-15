/**
 * MIGRATED TO campus6 schema
 * Updated: driveController-new.js with status ENUM (Draft, Active, Closed, Archived)
 * Removed: company_id from drives (derived via drive -> jd_id -> company_id)
 * Updated: All queries use tbl_cp_recruitment_drive with proper JD and company joins
 */

const express = require('express');
const router = express.Router();
const driveController = require('../controllers/driveController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// ============================================================================
// PUBLIC ROUTES - No Authentication Required
// ============================================================================

// Get list of drives (optional status filter - only return Active drives for students)
router.get('/', driveController.getDrives);

// Get a single drive by ID
router.get('/:id', driveController.getDriveById);

// Get all applications for a drive
router.get('/:id/applications', authenticate, requireRole(['admin', 'tpo', 'recruiter']), driveController.getDriveApplications);

// ============================================================================
// PROTECTED ROUTES - Admin/TPO/Recruiter Only
// ============================================================================

// Create a new drive (admin, tpo, recruiter)
router.post(
  '/',
  authenticate,
  requireRole(['admin', 'tpo', 'recruiter']),
  driveController.createDrive
);

// Update an existing drive (admin, tpo, recruiter)
router.put(
  '/:id',
  authenticate,
  requireRole(['admin', 'tpo', 'recruiter']),
  driveController.updateDrive
);

// Close a drive (transition from Active to Closed)
router.patch(
  '/:id/close',
  authenticate,
  requireRole(['admin', 'tpo', 'recruiter']),
  driveController.closeDrive
);

// Archive a drive (soft delete - set to Archived status)
router.patch(
  '/:id/archive',
  authenticate,
  requireRole(['admin', 'tpo']),
  driveController.archiveDrive
);

// Delete (soft) a drive (admin only)
router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  driveController.deleteDrive
);

module.exports = router;
