const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { requireRole, checkPermission, onlyOwnData } = require('../middleware/rbac');

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

// Create new user
router.post('/', authenticate, requireRole('admin'), userController.createUser);

// Update user
router.put('/:id', authenticate, requireRole('admin'), userController.updateUser);

// Delete user (soft delete)
router.delete('/:id', authenticate, requireRole('admin'), userController.deleteUser);

module.exports = router;
