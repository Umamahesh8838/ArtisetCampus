const { pool } = require('../config/db');
const { buildDraftFromDb } = require('../utils/draftExtractor');
const generateOtp = require('../utils/generateOtp');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  resolveLanguageId, resolveSkillId, resolveInterestId,
  resolveCertificationId, resolvePincodeId, resolveCollegeId, resolveCourseId,
  getNextId, resolveGenericId, upsertGeographyChain, insertWithNextId
} = require('../utils/masterHelpers2');
const { normalizeDraft } = require('../utils/validation');
const { processRegistration } = require('./registrationService');
const logger = require('../utils/logger');

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_secret';

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
  if (!email) return res.status(400).json({ message: 'Email is required' });
  try {
    await sendOtpGeneric(email, 'email');
    return res.json({ message: 'OTP generated successfully' });
  } catch (err) {
    logger.error('sendEmailOtp error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function sendPhoneOtp(req, res) {
  // Accept either `phone` or `contact_number` from various frontends
  const phone = req.body.phone || req.body.contact_number;
  if (!phone) return res.status(400).json({ message: 'Phone is required (phone or contact_number)' });
  try {
    await sendOtpGeneric(phone, 'phone');
    return res.json({ message: 'OTP generated successfully' });
  } catch (err) {
    logger.error('sendPhoneOtp error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function verifyOtpGeneric(identifier, type, otp) {
  const [rows] = await pool.execute(
    'SELECT * FROM otp_requests WHERE identifier = ? AND type = ? ORDER BY created_at DESC LIMIT 1',
    [identifier, type]
  );
  if (!rows || rows.length === 0) return { ok: false, message: 'No OTP request found for this identifier' };

  const record = rows[0];
  if (record.is_verified) return { ok: false, message: 'OTP already verified' };

  const now = new Date();
  const expiresAt = new Date(record.expires_at);
  if (now > expiresAt) return { ok: false, message: 'OTP has expired' };

  const match = await bcrypt.compare(otp, record.otp_code);
  if (!match) return { ok: false, message: 'Invalid OTP' };

  await pool.execute('UPDATE otp_requests SET is_verified = ? WHERE id = ?', [true, record.id]);
  return { ok: true };
}

async function verifyEmailOtp(req, res) {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });
  try {
    const result = await verifyOtpGeneric(email, 'email', otp);
    if (!result.ok) return res.status(400).json({ message: result.message });
    return res.json({ message: 'OTP verified successfully' });
  } catch (err) {
    logger.error('verifyEmailOtp error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function verifyPhoneOtp(req, res) {
  const phone = req.body.phone || req.body.contact_number;
  const { otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ message: 'Phone (phone or contact_number) and OTP are required' });
  try {
    const result = await verifyOtpGeneric(phone, 'phone', otp);
    if (!result.ok) return res.status(400).json({ message: result.message });
    return res.json({ message: 'OTP verified successfully' });
  } catch (err) {
    logger.error('verifyPhoneOtp error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function signup(req, res) {
  // Accept contact_number as alias for phone
  const { first_name, last_name, email, password } = req.body;
  const phone = req.body.phone || req.body.contact_number;
  if (!first_name || !last_name || !email || !phone || !password) {
    return res.status(400).json({ message: 'first_name, last_name, email, phone (or contact_number) and password are required' });
  }

  try {
    // Check email verified
    const [emailRows] = await pool.execute(
      'SELECT * FROM otp_requests WHERE identifier = ? AND type = ? ORDER BY created_at DESC LIMIT 1',
      [email, 'email']
    );
    if (!emailRows || emailRows.length === 0 || !emailRows[0].is_verified) {
      return res.status(400).json({ message: 'Email not verified by OTP' });
    }

    // Check phone verified
    const [phoneRows] = await pool.execute(
      'SELECT * FROM otp_requests WHERE identifier = ? AND type = ? ORDER BY created_at DESC LIMIT 1',
      [phone, 'phone']
    );
    if (!phoneRows || phoneRows.length === 0 || !phoneRows[0].is_verified) {
      return res.status(400).json({ message: 'Phone not verified by OTP' });
    }

    // Check if user already exists by email or phone in users or tbl_cp_student
    const [existingAuth] = await pool.execute('SELECT * FROM users WHERE email = ? OR phone = ? LIMIT 1', [email, phone]);
    const [existingProfile] = await pool.execute('SELECT * FROM tbl_cp_student WHERE email = ? OR contact_number = ? LIMIT 1', [email, phone]);
    if ((existingAuth && existingAuth.length > 0) || (existingProfile && existingProfile.length > 0)) {
      return res.status(400).json({ message: 'User with this email or phone already exists' });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Use a transaction to create both auth record and student profile
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const insertAuthSql = 'INSERT INTO users (email, phone, password, first_name, last_name, is_email_verified, is_phone_verified) VALUES (?, ?, ?, ?, ?, ?, ?)';
      const [authResult] = await conn.execute(insertAuthSql, [email, phone, hashedPassword, first_name, last_name, true, true]);
      const userId = authResult.insertId;

      // Use the Shared Primary Key pattern: student_id exactly equals users.id (auth record)
      // If a profile already exists with this student_id (legacy), update it; otherwise insert.
      const [existingStudentRows] = await conn.execute('SELECT student_id FROM tbl_cp_student WHERE student_id = ? LIMIT 1', [userId]);
      if (existingStudentRows && existingStudentRows.length > 0) {
        await conn.execute(
          `UPDATE tbl_cp_student SET first_name = ?, last_name = ?, email = ?, contact_number = ? WHERE student_id = ?`,
          [first_name, last_name, email, phone, userId]
        );
      } else {
        const insertProfileSql = `INSERT INTO tbl_cp_student (student_id, first_name, last_name, email, contact_number) VALUES (?, ?, ?, ?, ?)`;
        await conn.execute(insertProfileSql, [userId, first_name, last_name, email, phone]);
      }

      await conn.commit();

      const token = jwt.sign({ user_id: userId, email, phone }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ message: 'Signup successful', token });
    } catch (errTrans) {
      await conn.rollback();
      throw errTrans;
    } finally {
      conn.release();
    }
  } catch (err) {
    logger.error('signup error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// ... new registration draft endpoints ...
async function getRegistrationDraft(req, res) {
  const { user_id } = req.user;
  try {
    const [rows] = await pool.execute('SELECT registration_draft, registration_step, is_registration_complete FROM users WHERE id = ?', [user_id]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'User not found' });

    let draft = rows[0].registration_draft;
    
    // If the draft is completely empty, it might be because the user was inserted via migration script.
    // We will attempt to build their profile json directly from the relational tables!
    if (!draft || (typeof draft === 'object' && Object.keys(draft).length === 0) || (typeof draft === 'string' && (draft === '{}' || draft === '""'))) {
        const extractedDraft = await buildDraftFromDb(user_id);
        if (extractedDraft && Object.keys(extractedDraft).length > 0) {
            draft = extractedDraft;
            // Optionally persist the extracted draft back to the users table
            await pool.execute('UPDATE users SET registration_draft = ? WHERE id = ?', [JSON.stringify(draft), user_id]);
        }
    }

    // If draft is a string, parse it so we don't send stringified json inside json
    if (typeof draft === 'string') {
      try { draft = JSON.parse(draft); } catch (e) {}
    }

    return res.json({
      draft: draft || {},
      step: rows[0].registration_step || 'basic',
      isComplete: rows[0].is_registration_complete
    });
  } catch (err) {
    logger.error('getRegistrationDraft error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function saveRegistrationDraft(req, res) {
  const { user_id } = req.user;
  const { draft, step } = req.body;

  if (!draft || !step) return res.status(400).json({ message: 'draft and step are required' });

  try {
    const stringifiedDraft = JSON.stringify(draft);
    await pool.execute(
      'UPDATE users SET registration_draft = ?, registration_step = ? WHERE id = ?',
      [stringifiedDraft, step, user_id]
    );
    return res.json({ message: 'Draft saved successfully' });
  } catch (err) {
    logger.error('saveRegistrationDraft error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Get logged-in user's basic signup info for pre-filling registration form
async function getMe(req, res) {
  const { user_id } = req.user;
  try {
    const [rows] = await pool.execute(
      'SELECT id, first_name, last_name, email, phone FROM users WHERE id = ?',
      [user_id]
    );
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'User not found' });
    return res.json(rows[0]);
  } catch (err) {
    logger.error('getMe error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function submitRegistration(req, res) {
  const { user_id } = req.user;
  let draft = req.body.draft;
  if (!draft) return res.status(400).json({ message: 'Draft is required' });

  // Normalize/validate incoming draft to reduce schema errors and provide defaults
  try {
    draft = normalizeDraft(draft || {});
  } catch (e) {
      logger.error('Error normalizing draft', e);
    return res.status(400).json({ message: 'Invalid draft format' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Delegate the heavy lifting to the registration service (keeps controller thin)
    await processRegistration(connection, user_id, draft);

    await connection.commit();
    connection.release();
    return res.json({ message: 'Registration submitted successfully' });

  } catch (err) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    logger.error('submitRegistration transaction error:', err.message || err);
    if (err && err.code) {
      logger.error('  → MySQL Error Code:', err.code);
      logger.error('  → SQL Message:', err.sqlMessage || err.message);
      logger.error('  → SQL:', err.sql ? err.sql.substring(0, 200) : 'N/A');
    }
    return res.status(500).json({
      message: 'Internal server error during final submission mapping',
      error: err.code || 'ERROR',
      detail: err.sqlMessage || err.message,
      sql: err.sql ? err.sql.substring(0, 300) : undefined
    });
  }
}

module.exports = {
  sendEmailOtp,
  verifyEmailOtp,
  sendPhoneOtp,
  verifyPhoneOtp,
  signup,
  getMe,
  getRegistrationDraft,
  saveRegistrationDraft,
  submitRegistration,
};


// Login endpoint: allow user to login with email or phone + password
async function login(req, res) {
  const { identifier, password } = req.body; // identifier can be email or phone
  if (!identifier || !password) return res.status(400).json({ message: 'identifier and password are required' });

  try {
    // Try find by email first, then phone
    const [rowsByEmail] = await pool.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [identifier]);
    let user = rowsByEmail && rowsByEmail.length ? rowsByEmail[0] : null;
    if (!user) {
      const [rowsByPhone] = await pool.execute('SELECT * FROM users WHERE phone = ? LIMIT 1', [identifier]);
      user = rowsByPhone && rowsByPhone.length ? rowsByPhone[0] : null;
    }

    if (!user) return res.status(400).json({ message: 'User not found' });

    if (!user.password) return res.status(400).json({ message: 'User has no password set' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ user_id: user.id, email: user.email, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      message: 'Login successful',
      token,
      is_registration_complete: Boolean(user.is_registration_complete),
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role || 'student',
        isActive: user.is_active !== false,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    logger.error('login error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Reset password endpoint: allow user to reset password after OTP verification
async function resetPassword(req, res) {
  const { identifier, new_password } = req.body;
  if (!identifier || !new_password) return res.status(400).json({ message: 'identifier and new_password are required' });

  try {
    // Check if OTP was verified for this identifier
    const [rows] = await pool.execute(
      'SELECT * FROM otp_requests WHERE identifier = ? AND is_verified = ? ORDER BY created_at DESC LIMIT 1',
      [identifier, true]
    );

    if (!rows || rows.length === 0) {
      return res.status(400).json({ message: 'Identity not verified by OTP' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password for user with matching email or phone
    const [result] = await pool.execute(
      'UPDATE users SET password = ? WHERE email = ? OR phone = ?',
      [hashedPassword, identifier, identifier]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ message: 'Password reset successful' });
  } catch (err) {
    logger.error('reset password error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Export login and resetPassword as well
module.exports.login = login;
module.exports.resetPassword = resetPassword;
