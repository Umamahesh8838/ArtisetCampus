const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_secret';

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = (req, res, next) => {
  try {
    // Get token from Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user to request
    req.user = {
      id: decoded.user_id,
      email: decoded.email,
      role: decoded.role || 'student',
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      logger.warn('Token expired:', err.message);
      return res.status(401).json({ error: 'Token expired' });
    }

    if (err.name === 'JsonWebTokenError') {
      logger.warn('Invalid token:', err.message);
      return res.status(401).json({ error: 'Invalid token' });
    }

    logger.error('Authentication error:', err.message);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

/**
 * Optional Authentication - does not fail if token is invalid
 * Just attaches user if valid token provided
 */
const authenticateOptional = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = {
        id: decoded.user_id,
        email: decoded.email,
        role: decoded.role || 'student',
      };
    }
  } catch (err) {
    // Silently fail, user is not authenticated but request continues
    logger.debug('Optional authentication skipped:', err.message);
  }

  next();
};

module.exports = {
  authenticate,
  authenticateOptional,
};
