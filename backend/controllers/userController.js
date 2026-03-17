const logger = require('../utils/logger');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * User Controller - User management, profile operations, admin functions
 */

// Get current user profile
async function getMe(req, res) {
  try {
    const userId = req.user.id;
    const { pool } = require('../config/db');

    const [rows] = await pool.execute(
      `SELECT id, email, phone, first_name, last_name, role, is_active, 
              is_email_verified, is_phone_verified, is_registration_complete,
              created_at, updated_at
       FROM users WHERE id = ?`,
      [userId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows[0];

    res.json({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role || 'student',
        isActive: user.is_active !== false,
        isEmailVerified: user.is_email_verified,
        isPhoneVerified: user.is_phone_verified,
        isRegistrationComplete: user.is_registration_complete,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      },
    });
  } catch (err) {
    logger.error('Get me error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Update current user profile
async function updateMe(req, res) {
  try {
    const userId = req.user.id;
    const { first_name, last_name, phone } = req.body;
    const { pool } = require('../config/db');

    // Validate inputs
    if (first_name && first_name.length > 100) {
      return res.status(400).json({ error: 'First name too long' });
    }
    if (last_name && last_name.length > 100) {
      return res.status(400).json({ error: 'Last name too long' });
    }

    // Prepare update
    const updates = [];
    const values = [];

    if (first_name) {
      updates.push('first_name = ?');
      values.push(first_name);
    }
    if (last_name) {
      updates.push('last_name = ?');
      values.push(last_name);
    }
    if (phone) {
      // Check if phone already exists for another user
      const [existingPhone] = await pool.execute(
        'SELECT id FROM users WHERE phone = ? AND id != ?',
        [phone, userId]
      );
      if (existingPhone && existingPhone.length > 0) {
        return res.status(400).json({ error: 'Phone number already registered' });
      }
      updates.push('phone = ?');
      values.push(phone);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(userId);

    await pool.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Fetch updated user
    const [updatedUser] = await pool.execute(
      `SELECT id, email, phone, first_name, last_name, role, is_active,
              is_email_verified, is_phone_verified, created_at
       FROM users WHERE id = ?`,
      [userId]
    );

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser[0],
    });
  } catch (err) {
    logger.error('Update me error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Change password
async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    const { pool } = require('../config/db');

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Get user
    const [users] = await pool.execute(
      'SELECT id, password FROM users WHERE id = ?',
      [userId]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    logger.info(`Password changed for user ${userId}`);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    logger.error('Change password error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

// Get all users (admin only)
async function getAllUsers(req, res) {
  try {
    const { role, is_active, limit = 20, offset = 0 } = req.query;
    const { pool } = require('../config/db');

    let query = 'SELECT id, email, phone, first_name, last_name, role, is_active, created_at FROM users WHERE 1=1';
    const values = [];

    if (role) {
      query += ' AND role = ?';
      values.push(role);
    }

    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      values.push(is_active === 'true' ? 1 : 0);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    values.push(parseInt(limit), parseInt(offset));

    const [users] = await pool.execute(query, values);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countValues = [];

    if (role) {
      countQuery += ' AND role = ?';
      countValues.push(role);
    }
    if (is_active !== undefined) {
      countQuery += ' AND is_active = ?';
      countValues.push(is_active === 'true' ? 1 : 0);
    }

    const [countResult] = await pool.execute(countQuery, countValues);
    const total = countResult[0].total;

    res.json({
      users,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (err) {
    logger.error('Get all users error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get user by ID (admin)
async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const { pool } = require('../config/db');

    const [users] = await pool.execute(
      `SELECT id, email, phone, first_name, last_name, role, is_active,
              is_email_verified, is_phone_verified, is_registration_complete,
              created_at, updated_at
       FROM users WHERE id = ?`,
      [id]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (err) {
    logger.error('Get user by ID error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Create new user (admin only)
async function createUser(req, res) {
  try {
    const { email, phone, first_name, last_name, password, role } = req.body;
    const { pool } = require('../config/db');

    // Validate inputs
    if (!email || !phone || !password) {
      return res.status(400).json({ error: 'Email, phone, and password are required' });
    }

    if (!['student', 'tpo', 'recruiter', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user exists
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ? OR phone = ?',
      [email, phone]
    );

    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'Email or phone already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await pool.execute(
      `INSERT INTO users (email, phone, first_name, last_name, password, role, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [email, phone, first_name, last_name, hashedPassword, role]
    );

    // If student role, create entry in tbl_cp_student
    if (role === 'student') {
      await pool.execute(
        `INSERT INTO tbl_cp_student (student_id, first_name, last_name, contact_number)
         VALUES (?, ?, ?, ?)`,
        [result.insertId, first_name, last_name, phone]
      );
    }

    logger.info(`User created: ${result.insertId} with role ${role}`);

    res.status(201).json({
      message: 'User created successfully',
      user_id: result.insertId,
    });
  } catch (err) {
    logger.error('Create user error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Update user (admin only)
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { first_name, last_name, role, is_active } = req.body;
    const { pool } = require('../config/db');

    // Verify user exists
    const [users] = await pool.execute('SELECT id, role FROM users WHERE id = ?', [id]);
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates = [];
    const values = [];

    if (first_name !== undefined) {
      updates.push('first_name = ?');
      values.push(first_name);
    }
    if (last_name !== undefined) {
      updates.push('last_name = ?');
      values.push(last_name);
    }
    if (role !== undefined) {
      if (!['student', 'tpo', 'recruiter', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      updates.push('role = ?');
      values.push(role);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    await pool.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    logger.info(`User ${id} updated by admin`);

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    logger.error('Update user error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Delete user (admin only)
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const { pool } = require('../config/db');

    // Verify user exists
    const [users] = await pool.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Soft delete - mark as inactive
    await pool.execute('UPDATE users SET is_active = 0 WHERE id = ?', [id]);

    logger.info(`User ${id} deleted (soft delete)`);

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    logger.error('Delete user error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getMe,
  updateMe,
  changePassword,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
