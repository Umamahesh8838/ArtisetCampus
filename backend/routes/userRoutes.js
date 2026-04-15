/**
 * MIGRATED TO campus6 schema
 * Updated: userController-new.js with role ENUM (student, tpo, recruiter, admin)
 * Updated: password column to password_hash
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// ============================================================================
// PROTECTED ROUTES - Require Authentication
// ============================================================================

// Get current user profile
router.get('/me', authenticate, userController.getMe);

// Update current user profile
router.put('/me', authenticate, userController.updateMe);

// Change password
router.post('/me/change-password', authenticate, userController.changePassword);

// ============================================================================
// ADMIN ROUTES - Admin Only
// ============================================================================

// Get all users
router.get('/', authenticate, requireRole('admin'), userController.getAllUsers);

// Get specific user by ID
router.get('/:id', authenticate, requireRole('admin'), userController.getUserById);

// Create new user (admin can create any role: student, tpo, recruiter, admin)
router.post('/', authenticate, requireRole('admin'), userController.createUser);

// Update user (admin can update any user - including changing role)
router.put('/:id', authenticate, requireRole('admin'), userController.updateUser);

// Delete user (soft delete - admin only)
router.delete('/:id', authenticate, requireRole('admin'), userController.deleteUser);

module.exports = router;
