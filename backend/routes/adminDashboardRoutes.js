const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminDashboardController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// Admin/TPO routes - require authentication and proper role
router.get('/dashboard', authenticate, requireRole(['admin', 'tpo']), adminController.getDashboardStats);
router.get('/reports', authenticate, requireRole(['admin', 'tpo']), adminController.getReportsStats);

module.exports = router;