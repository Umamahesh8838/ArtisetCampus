require('dotenv').config();
const { pool } = require('../config/db');
const { upsertGeographyChain } = require('../utils/masterHelpers2');
const logger = require('../utils/logger');

async function run() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const pincodeId = await upsertGeographyChain(conn, 'TestCountry', 'TestState', 'TestCity', '560001', 'Test Area');
    logger.info('upsertGeographyChain returned pincode_id =', pincodeId);
    // Rollback to avoid polluting the real database during test
    await conn.rollback();
    logger.info('Rolled back test transaction (no changes persisted)');
  } catch (err) {
    logger.error('test_upsert.js error:', err);
    try { await conn.rollback(); } catch(e) {}
  } finally {
    conn.release();
    process.exit(0);
  }
}

run();
