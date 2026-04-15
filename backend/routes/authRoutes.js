/**
 * MIGRATED TO campus6 schema
 * Updated: Import from authController (kept same as original since auth logic mostly unchanged)
 */

const express = require('express');
const router = express.Router();
const {
	sendEmailOtp,
	verifyEmailOtp,
	sendPhoneOtp,
	verifyPhoneOtp,
	signup,
	login,
	resetPassword,
	getMe,
	getRegistrationDraft,
	saveRegistrationDraft,
	submitRegistration
} = require('../controllers/authController');

const { authenticateToken } = require('../utils/authMiddleware');

// OTP Routes
router.post('/send-email-otp', sendEmailOtp);
router.post('/verify-email-otp', verifyEmailOtp);

router.post('/send-phone-otp', sendPhoneOtp);
router.post('/verify-phone-otp', verifyPhoneOtp);

// Authentication Routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/reset-password', resetPassword);

// User Profile
router.get('/me', authenticateToken, getMe);

// Registration Draft Routes (for student registration)
router.get('/registration/draft', authenticateToken, getRegistrationDraft);
router.put('/registration/draft', authenticateToken, saveRegistrationDraft);
router.post('/registration/submit', authenticateToken, submitRegistration);

module.exports = router;
