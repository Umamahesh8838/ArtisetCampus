const express = require('express');
const { getDashboardData } = require('../controllers/studentController');
const { authenticateToken } = require('../utils/authMiddleware');

const router = express.Router();

// All student routes should be protected
router.use(authenticateToken);

router.get('/dashboard', getDashboardData);

module.exports = router;
