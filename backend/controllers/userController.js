// MIGRATED TO campus6 schema - User management and profile operations
// Changed: Verified role ENUM values, Updated password column reference

const logger = require('../utils/logger');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// Valid role ENUM values
const VALID_ROLES = ['student', 'tpo', 'recruiter', 'admin'];

/**
 * Get current user profile
 */
async function getMe(req, res) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const [rows] = await pool.execute(
      `SELECT id, email, phone, role, is_active, created_at, updated_at
       FROM users WHERE id = ?`,
      [userId]
    );
    
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = rows[0];
    
    // Get student info if role is student
    let studentInfo = null;
    if (user.role === 'student') {
      const [students] = await pool.execute(
        `SELECT student_id, first_name, last_name, profile_photo_url
         FROM tbl_cp_student WHERE student_id = ?`,
        [userId]
      );
      
      if (students.length > 0) {
        studentInfo = students[0];
      }
    }
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.is_active === 1,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        ...studentInfo
      }
    });
  } catch (err) {
    logger.error('Get me error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update current user profile
 */
async function updateMe(req, res) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { email, phone } = req.body;
    
    // Build dynamic update query
    const updates = [];
    const values = [];
    
    if (email !== undefined) {
      // Check if email already exists for another user
      const [existing] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );
      
      if (existing && existing.length > 0) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      
      updates.push('email = ?');
      values.push(email);
    }
    
    if (phone !== undefined) {
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
    updates.push('updated_at = NOW()');
    
    await pool.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    // Fetch updated user
    const [updatedUser] = await pool.execute(
      'SELECT id, email, phone, role FROM users WHERE id = ?',
      [userId]
    );
    
    logger.info(`User ${userId} profile updated`);
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser[0]
    });
  } catch (err) {
    logger.error('Update me error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Change password for current user
 */
async function changePassword(req, res) {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords required' });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
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
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
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

/**
 * Get all users (admin only)
 */
async function getAllUsers(req, res) {
  try {
    const { role, is_active, limit = 20, offset = 0 } = req.query;
    
    let query = `
      SELECT id, email, phone, role, is_active, created_at, updated_at
      FROM users
      WHERE 1=1
    `;
    const values = [];
    
    if (role) {
      if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` });
      }
      query += ' AND role = ?';
      values.push(role);
    }
    
    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      values.push(is_active === 'true' || is_active == 1 ? 1 : 0);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    values.push((parseInt(limit, 10) || 20), (parseInt(offset, 10) || 0));
    
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
      countValues.push(is_active === 'true' || is_active == 1 ? 1 : 0);
    }
    
    const [countResult] = await pool.execute(countQuery, countValues);
    const total = countResult[0].total;
    
    res.json({
      users,
      total,
      limit: (parseInt(limit, 10) || 20),
      offset: (parseInt(offset, 10) || 0)
    });
  } catch (err) {
    logger.error('Get all users error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get user by ID (admin)
 */
async function getUserById(req, res) {
  try {
    const { id } = req.params;
    
    const [users] = await pool.execute(
      `SELECT id, email, phone, role, is_active, created_at, updated_at
       FROM users WHERE id = ?`,
      [id]
    );
    
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    
    // If student, get additional student info
    if (user.role === 'student') {
      const [students] = await pool.execute(
        `SELECT first_name, last_name, profile_photo_url FROM tbl_cp_student WHERE student_id = ?`,
        [user.id]
      );
      
      if (students.length > 0) {
        Object.assign(user, students[0]);
      }
    }
    
    res.json(user);
  } catch (err) {
    logger.error('Get user by ID error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Create new user (admin only)
 */
async function createUser(req, res) {
  try {
    const { email, phone, password, role = 'student' } = req.body;
    
    // Validate inputs
    if (!email || !phone || !password) {
      return res.status(400).json({
        error: 'Email, phone, and password are required'
      });
    }
    
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({
        error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`
      });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
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
    
    let conn;
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();
      
      // Create user (id will auto-increment)
      const result = await conn.execute(
        `INSERT INTO users (email, phone, password, role, is_active)
         VALUES (?, ?, ?, ?, 1)`,
        [email, phone, hashedPassword, role]
      );
      
      const userId = result[0].insertId;
      
      // If student role, create entry in tbl_cp_student
      if (role === 'student') {
        await conn.execute(
          `INSERT INTO tbl_cp_student (student_id, email, contact_number, is_active)
           VALUES (?, ?, ?, 1)`,
          [userId, email, phone]
        );
      }
      
      await conn.commit();
      
      logger.info(`User created: ${nextUserId} with role ${role}`);
      
      res.status(201).json({
        message: 'User created successfully',
        user_id: userId
      });
    } finally {
      if (conn) conn.release();
    }
  } catch (err) {
    logger.error('Create user error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update user (admin only)
 */
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { role, is_active, phone } = req.body;
    
    // Verify user exists
    const [users] = await pool.execute(
      'SELECT user_id FROM users WHERE user_id = ?',
      [id]
    );
    
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const updates = [];
    const values = [];
    
    if (role !== undefined) {
      if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({
          error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`
        });
      }
      updates.push('role = ?');
      values.push(role);
    }
    
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }
    
    if (phone !== undefined) {
      // Check if phone already exists for another user
      const [existingPhone] = await pool.execute(
        'SELECT id FROM users WHERE phone = ? AND id != ?',
        [phone, id]
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
    
    values.push(id);
    updates.push('updated_at = NOW()');
    
    await pool.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    logger.info(`User ${id} updated`);
    
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    logger.error('Update user error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Deactivate user (admin only)
 * Soft delete by setting is_active = 0
 */
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    
    // Verify user exists
    const [users] = await pool.execute(
      'SELECT user_id FROM users WHERE user_id = ?',
      [id]
    );
    
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Soft delete - mark as inactive
    await pool.execute(
      'UPDATE users SET is_active = 0, updated_date = NOW() WHERE user_id = ?',
      [id]
    );
    
    logger.info(`User ${id} deactivated`);
    
    res.json({ message: 'User deactivated successfully' });
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
  deleteUser
};
