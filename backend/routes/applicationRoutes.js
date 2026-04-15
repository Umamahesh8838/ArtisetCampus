// MIGRATED TO campus6 schema - Application routes with updated endpoints
// New: GET /applications/:id/history - view application status history
// Updated: Only requires drive_id (no jd_id, company_id)

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  applyToDrive,
  getApplicationById,
  listStudentApplications,
  listAllApplications,
  updateApplicationStatus,
  getApplicationHistory
} = require('../controllers/applicationController');

// Public routes (students)
router.post('/', authenticate, applyToDrive);
router.get('/my', authenticate, listStudentApplications);
router.get('/:id', authenticate, getApplicationById);
router.get('/:id/history', authenticate, getApplicationHistory);

// Admin/TPO routes
router.get('/', authenticate, listAllApplications);
router.patch('/:id/status', authenticate, updateApplicationStatus);

module.exports = router;
