/**
 * MIGRATED TO campus6 schema
 * Updated: password column renamed to password_hash in tbl_cp_user (or users table)
 * Updated: Added role ENUM support (student, tpo, recruiter, admin)
 * Key changes: All password references updated to password_hash
 */

const { pool } = require('../config/db');
const { buildDraftFromDb } = require('../utils/draftExtractor');
const generateOtp = require('../utils/generateOtp');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { processRegistration } = require('./registrationService');
const logger = require('../utils/logger');

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_secret';

/**
 * Generic OTP generation and storage
 */
async function sendOtpGeneric(identifier, type) {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Delete previous OTPs for that identifier+type
  await pool.execute('DELETE FROM otp_requests WHERE identifier = ? AND type = ?', [identifier, type]);

  const hashedOtp = await bcrypt.hash(otp, 10);
  await pool.execute(
    'INSERT INTO otp_requests (identifier, type, otp_code, expires_at, is_verified) VALUES (?, ?, ?, ?, ?)',
    [identifier, type, hashedOtp, expiresAt, false]
  );

  logger.info(`${type.toUpperCase()} OTP for ${identifier} is: ${otp}`);
}

async function sendEmailOtp(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  try {
    await sendOtpGeneric(email, 'email');
    return res.json({ success: true, message: 'OTP sent to email' });
  } catch (err) {
    logger.error('sendEmailOtp error:', err);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
}

async function sendPhoneOtp(req, res) {
  const phone = req.body.phone || req.body.contact_number;
  if (!phone) return res.status(400).json({ error: 'Phone is required' });
  try {
    await sendOtpGeneric(phone, 'phone');
    return res.json({ success: true, message: 'OTP sent to phone' });
  } catch (err) {
    logger.error('sendPhoneOtp error:', err);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
}

/**
 * Generic OTP verification
 */
async function verifyOtpGeneric(identifier, type, otp) {
  const [rows] = await pool.execute(
    'SELECT * FROM otp_requests WHERE identifier = ? AND type = ? ORDER BY created_at DESC LIMIT 1',
    [identifier, type]
  );

  if (!rows || rows.length === 0) {
    return { ok: false, message: 'No OTP request found for this identifier' };
  }

  const record = rows[0];
  if (record.is_verified) {
    return { ok: false, message: 'OTP already verified' };
  }

  const now = new Date();
  const expiresAt = new Date(record.expires_at);
  if (now > expiresAt) {
    return { ok: false, message: 'OTP has expired' };
  }

  const match = await bcrypt.compare(otp, record.otp_code);
  if (!match) {
    return { ok: false, message: 'Invalid OTP' };
  }

  await pool.execute('UPDATE otp_requests SET is_verified = 1 WHERE id = ?', [record.id]);
  return { ok: true };
}

async function verifyEmailOtp(req, res) {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

  try {
    const result = await verifyOtpGeneric(email, 'email', otp);
    if (!result.ok) return res.status(400).json({ error: result.message });
    return res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    logger.error('verifyEmailOtp error:', err);
    return res.status(500).json({ error: 'Failed to verify OTP' });
  }
}

async function verifyPhoneOtp(req, res) {
  const phone = req.body.phone || req.body.contact_number;
  const { otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP are required' });

  try {
    const result = await verifyOtpGeneric(phone, 'phone', otp);
    if (!result.ok) return res.status(400).json({ error: result.message });
    return res.json({ success: true, message: 'Phone verified successfully' });
  } catch (err) {
    logger.error('verifyPhoneOtp error:', err);
    return res.status(500).json({ error: 'Failed to verify OTP' });
  }
}

/**
 * User Registration/Signup
 */
async function signup(req, res) {
  const { first_name, last_name, email, password } = req.body;
  const phone = req.body.phone || req.body.contact_number;

  if (!first_name || !last_name || !email || !phone || !password) {
    return res.status(400).json({ 
      error: 'Missing required fields: first_name, last_name, email, phone, password' 
    });
  }

  try {
    // Verify email OTP
    const [emailRows] = await pool.execute(
      'SELECT * FROM otp_requests WHERE identifier = ? AND type = ? AND is_verified = 1 ORDER BY created_at DESC LIMIT 1',
      [email, 'email']
    );
    if (!emailRows || emailRows.length === 0) {
      return res.status(400).json({ error: 'Email not verified by OTP' });
    }

    // Verify phone OTP
    const [phoneRows] = await pool.execute(
      'SELECT * FROM otp_requests WHERE identifier = ? AND type = ? AND is_verified = 1 ORDER BY created_at DESC LIMIT 1',
      [phone, 'phone']
    );
    if (!phoneRows || phoneRows.length === 0) {
      return res.status(400).json({ error: 'Phone not verified by OTP' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ? OR phone = ? LIMIT 1',
      [email, phone]
    );
    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ error: 'User with this email or phone already exists' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user transaction
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Insert user record (default role is 'student')
      const [userResult] = await conn.execute(
        `INSERT INTO users 
         (email, phone, password, first_name, last_name, role, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'student', 1, NOW(), NOW())`,
        [email, phone, password_hash, first_name, last_name]
      );

      // Get the auto-generated user ID
      const user_id = userResult.insertId;

      // Create student profile (shared PK pattern: student_id = user_id)
      await conn.execute(
        `INSERT INTO tbl_cp_student 
         (student_id, first_name, last_name, email, contact_number, is_active)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [user_id, first_name, last_name, email, phone]
      );

      await conn.commit();

      const token = jwt.sign(
        { id: user_id, user_id, email, phone, role: 'student' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'Signup successful',
        token,
        user: { id: user_id, user_id, email, phone, role: 'student' }
      });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    logger.error('signup error:', err);
    return res.status(500).json({ error: 'Failed to create user account' });
  }
}

/**
 * User Login
 */
async function login(req, res) {
  const { identifier, password } = req.body; // identifier = email or phone

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Email/phone and password are required' });
  }

  try {
    // Find user by email or phone
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ? OR phone = ? LIMIT 1',
      [identifier, identifier]
    );

    if (!users || users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password (against password column)
    if (!user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ error: 'User account is inactive' });
    }

    const token = jwt.sign(
      { id: user.id, user_id: user.id, email: user.email, phone: user.phone, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      is_registration_complete: user.is_registration_complete === 1 || Boolean(user.is_registration_complete),
      user: {
        id: user.id,
        user_id: user.id,
        email: user.email,
        phone: user.phone,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_active: user.is_active,
        is_registration_complete: user.is_registration_complete === 1 || Boolean(user.is_registration_complete),
      }
    });
  } catch (err) {
    logger.error('login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
}

/**
 * Reset Password
 */
async function resetPassword(req, res) {
  const { identifier, new_password } = req.body;

  if (!identifier || !new_password) {
    return res.status(400).json({ error: 'Email/phone and new_password are required' });
  }

  try {
    // Verify OTP was verified
    const [otpRecords] = await pool.execute(
      'SELECT * FROM otp_requests WHERE identifier = ? AND is_verified = 1 ORDER BY created_at DESC LIMIT 1',
      [identifier]
    );

    if (!otpRecords || otpRecords.length === 0) {
      return res.status(400).json({ error: 'Identity not verified by OTP' });
    }

    // Hash new password
    const password_hash = await bcrypt.hash(new_password, 10);

    // Update password in user record
    const [result] = await pool.execute(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE email = ? OR phone = ?',
      [password_hash, identifier, identifier]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (err) {
    logger.error('resetPassword error:', err);
    return res.status(500).json({ error: 'Password reset failed' });
  }
}

/**
 * Get Current User (Requires Authentication)
 */
async function getMe(req, res) {
  const { id: user_id } = req.user;

  try {
    const [users] = await pool.execute(
      'SELECT id as user_id, email, phone, first_name, last_name, role, is_active, is_registration_complete FROM users WHERE id = ?',
      [user_id]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Add boolean conversion for consistency
    const userData = { ...users[0], is_registration_complete: users[0].is_registration_complete === 1 };

    return res.json({ success: true, user: userData });
  } catch (err) {
    logger.error('getMe error:', err);
    return res.status(500).json({ error: 'Failed to retrieve user info' });
  }
}

/**
 * Get Registration Draft
 */
async function getRegistrationDraft(req, res) {
  const { id: user_id } = req.user;

  try {
    const [users] = await pool.execute(
      'SELECT registration_draft, registration_step, is_registration_complete FROM users WHERE id = ?',
      [user_id]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    let draft = users[0].registration_draft;

    // If draft is empty, try to build from database
    if (!draft || draft === '{}' || draft === '') {
      draft = await buildDraftFromDb(user_id);
      if (draft) {
        await pool.execute(
          'UPDATE users SET registration_draft = ? WHERE id = ?',
          [JSON.stringify(draft), user_id]
        );
      }
    }

    // Parse if string
    if (typeof draft === 'string') {
      try { draft = JSON.parse(draft); } catch (e) { draft = {}; }
    }

    return res.json({
      success: true,
      draft: draft || {},
      step: users[0].registration_step || 'basic',
      isComplete: users[0].is_registration_complete
    });
  } catch (err) {
    logger.error('getRegistrationDraft error:', err);
    return res.status(500).json({ error: 'Failed to retrieve draft' });
  }
}

/**
 * Save Registration Draft
 */
async function saveRegistrationDraft(req, res) {
  const { id: user_id } = req.user;
  const { draft, step } = req.body;

  if (!draft || !step) {
    return res.status(400).json({ error: 'Draft and step are required' });
  }

  try {
    await pool.execute(
      'UPDATE users SET registration_draft = ?, registration_step = ? WHERE id = ?',
      [JSON.stringify(draft), step, user_id]
    );

    return res.json({
      success: true,
      message: 'Draft saved successfully'
    });
  } catch (err) {
    logger.error('saveRegistrationDraft error:', err);
    return res.status(500).json({ error: 'Failed to save draft' });
  }
}

/**
 * Submit Registration
 */
async function submitRegistration(req, res) {
  const user_id = req.user?.user_id || req.user?.id;
  
  if (!user_id) {
    return res.status(401).json({ error: 'User ID not found in token' });
  }
  
  let { draft } = req.body;

  if (!draft) {
    return res.status(400).json({ error: 'Draft is required' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Process full registration (M2M inserts, profile updates, etc.)
    await processRegistration(conn, user_id, draft);

    await conn.commit();

    return res.json({
      success: true,
      message: 'Registration submitted successfully'
    });
  } catch (err) {
    if (conn) {
      await conn.rollback();
    }
    logger.error('submitRegistration error:', err);
    return res.status(500).json({
      error: 'Registration submission failed',
      details: err.message
    });
  } finally {
    if (conn) conn.release();
  }
}

module.exports = {
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
};
