const express = require('express');
const router = express.Router();
const {
	sendEmailOtp,
	verifyEmailOtp,
	sendPhoneOtp,
	verifyPhoneOtp,
	signup,
} = require('../controllers/authController');

const { authenticateToken } = require('../utils/authMiddleware');

router.post('/send-email-otp', sendEmailOtp);
router.post('/verify-email-otp', verifyEmailOtp);

router.post('/send-phone-otp', sendPhoneOtp);
router.post('/verify-phone-otp', verifyPhoneOtp);

router.post('/signup', signup);
router.post('/login', require('../controllers/authController').login);
router.post('/reset-password', require('../controllers/authController').resetPassword);

// Get current user profile (for pre-filling registration form)
router.get('/me', authenticateToken, require('../controllers/authController').getMe);

// Registration draft routes
router.get('/registration/draft', authenticateToken, require('../controllers/authController').getRegistrationDraft);
router.put('/registration/draft', authenticateToken, require('../controllers/authController').saveRegistrationDraft);
router.post('/registration/submit', authenticateToken, require('../controllers/authController').submitRegistration);

module.exports = router;
