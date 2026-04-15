const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminDashboardController');
const auth = require('../middleware/auth');

// Make sure these require admin or TPO role in actual app
router.get('/dashboard', auth, adminController.getDashboardStats);
router.get('/reports', auth, adminController.getReportsStats);

module.exports = router;