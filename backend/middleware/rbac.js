const logger = require('../utils/logger');

/**
 * RBAC Middleware - Role-Based Access Control
 * Middleware to check user roles and permissions
 */

// Permission definitions
const PERMISSIONS = {
  STUDENT: {
    applications: ['create', 'read', 'list'],
    exams: ['read', 'list', 'submit'],
    placements: ['read', 'list'],
    profile: ['read', 'update'],
  },
  TPO: {
    drives: ['create', 'read', 'update', 'list'],
    sessions: ['create', 'read', 'update', 'list'],
    students: ['read', 'list'],
    placements: ['read', 'list'],
    companies: ['read', 'list'],
  },
  RECRUITER: {
    jobs: ['create', 'read', 'update', 'list'],
    applications: ['read', 'list', 'update'],
    interviews: ['create', 'read', 'update', 'list'],
    offers: ['create', 'read', 'update', 'list'],
  },
  ADMIN: {
    all: ['*'], // Full access
  },
};

/**
 * Check if user has a specific role
 */
const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        logger.warn('Unauthorized access attempt - no user');
        return res.status(401).json({ error: 'Unauthorized: No user found' });
      }

      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

      if (!roles.includes(user.role)) {
        logger.warn(`Forbidden access attempt - User ${user.id} with role ${user.role} tried to access ${req.method} ${req.path}`);
        return res.status(403).json({ 
          error: `Forbidden: Required role(s): ${roles.join(', ')}. Your role: ${user.role}` 
        });
      }

      next();
    } catch (err) {
      logger.error('RBAC check error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Check if user has a specific permission
 * Usage: checkPermission('applications', 'create')
 */
const checkPermission = (resource, action) => {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        logger.warn('Unauthorized access - no user found');
        return res.status(401).json({ error: 'Unauthorized: No user found' });
      }

      const userPermissions = PERMISSIONS[user.role?.toUpperCase()] || {};

      // Admin has all permissions
      if (user.role === 'admin' && userPermissions.all?.includes('*')) {
        return next();
      }

      const resourcePermissions = userPermissions[resource] || [];

      if (!resourcePermissions.includes(action)) {
        logger.warn(
          `Permission denied - User ${user.id} (${user.role}) lacks ${action} permission on ${resource}`
        );
        return res.status(403).json({
          error: `Permission denied: Cannot ${action} ${resource}`,
        });
      }

      next();
    } catch (err) {
      logger.error('Permission check error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Only allow access to own data (student can only access their own profile/applications)
 * Pass the ID parameter name, e.g., 'student_id', 'user_id'
 */
const onlyOwnData = (idParamName = 'id') => {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        logger.warn('Unauthorized access - no user found');
        return res.status(401).json({ error: 'Unauthorized: No user found' });
      }

      // Admin and TPO can access any data
      if (['admin', 'tpo'].includes(user.role)) {
        return next();
      }

      // For students, check if they're accessing their own data
      const requestedId = parseInt(req.params[idParamName] || req.body[idParamName]);
      const userId = user.id;

      if (requestedId !== userId && user.role === 'student') {
        logger.warn(`Data access violation - User ${user.id} tried to access ${idParamName}=${requestedId}`);
        return res.status(403).json({
          error: 'Forbidden: Can only access your own data',
        });
      }

      next();
    } catch (err) {
      logger.error('Own data check error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Role-based rate limiting middleware
 * Different roles have different rate limits
 */
const roleBasedRateLimit = (limits) => {
  const requestCounts = new Map();

  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return next(); // Skip rate limiting for unauthenticated
      }

      const role = user.role || 'student';
      const limit = limits[role] || limits.default || 100;
      const windowMs = limits.windowMs || 60000; // 1 minute

      const key = `${user.id}`;
      const now = Date.now();

      if (!requestCounts.has(key)) {
        requestCounts.set(key, { count: 1, resetTime: now + windowMs });
        return next();
      }

      const userRecord = requestCounts.get(key);

      if (now > userRecord.resetTime) {
        userRecord.count = 1;
        userRecord.resetTime = now + windowMs;
        return next();
      }

      userRecord.count++;

      if (userRecord.count > limit) {
        logger.warn(`Rate limit exceeded for user ${user.id} (${role})`);
        return res.status(429).json({
          error: 'Too many requests. Please try again later.',
        });
      }

      next();
    } catch (err) {
      logger.error('Rate limit check error:', err);
      next(); // Don't block on error
    }
  };
};

/**
 * Audit logging middleware - logs all state-changing operations
 */
const auditLog = (pool) => {
  return async (req, res, next) => {
    // Capture original response send
    const originalSend = res.send;

    res.send = function (data) {
      try {
        const user = req.user;
        const isStateChanging = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);

        if (isStateChanging && user) {
          const logData = {
            user_id: user.id,
            action: `${req.method} ${req.path}`,
            entity_type: extractEntityType(req.path),
            entity_id: extractEntityId(req.params),
            ip_address: req.ip,
            user_agent: req.get('user-agent'),
            old_values: req.oldValues ? JSON.stringify(req.oldValues) : null,
            new_values: req.body ? JSON.stringify(req.body) : null,
          };

          // Log asynchronously to not block response
          pool.execute(
            `INSERT INTO tbl_cp_audit_log 
             (user_id, action, entity_type, entity_id, ip_address, user_agent, old_values, new_values)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              logData.user_id,
              logData.action,
              logData.entity_type,
              logData.entity_id,
              logData.ip_address,
              logData.user_agent,
              logData.old_values,
              logData.new_values,
            ]
          ).catch((err) => {
            logger.error('Audit log error:', err.message);
          });
        }
      } catch (err) {
        logger.error('Audit logging middleware error:', err);
      }

      // Call original send
      originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Helper function to extract entity type from URL path
 */
function extractEntityType(path) {
  const segments = path.split('/').filter(Boolean);
  if (segments.length >= 2) {
    return segments[1].replace(/-/g, '_'); // e.g., 'job-descriptions' -> 'job_descriptions'
  }
  return 'unknown';
}

/**
 * Helper function to extract entity ID from route params
 */
function extractEntityId(params) {
  if (params.id) return params.id;
  if (params.student_id) return params.student_id;
  if (params.application_id) return params.application_id;
  if (params.jd_id) return params.jd_id;
  return null;
}

module.exports = {
  requireRole,
  checkPermission,
  onlyOwnData,
  roleBasedRateLimit,
  auditLog,
  PERMISSIONS,
};
