require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'test',
      waitForConnections: true,
      connectionLimit: 5,
    });

    const [rows] = await pool.execute(
      "SELECT id, email, otp_code, expires_at, is_verified, created_at FROM otp_requests ORDER BY created_at DESC LIMIT 10"
    );

    const logger = require('../utils/logger');
    if (!rows || rows.length === 0) {
      logger.info('No otp_requests rows found');
    } else {
      // Keep table display for convenience but log via logger
      logger.info('otp_requests rows:', rows.map(r => ({
        id: r.id,
        email: r.email,
        otp_code_prefix: r.otp_code ? r.otp_code.slice(0,8) : null,
        expires_at: r.expires_at,
        is_verified: r.is_verified,
        created_at: r.created_at
      })));
    }

    await pool.end();
  } catch (err) {
    const logger = require('../utils/logger');
    logger.error('Error querying otp_requests:', err.message || err);
    process.exit(1);
  }
})();
