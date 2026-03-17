require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const { initDb } = require('./config/db');
const logger = require('./utils/logger');

const app = express();

// Support multiple frontend origins (comma-separated) for dev environments
// Example: FRONTEND_ORIGINS=http://localhost:3000,http://localhost:8080
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS || 'http://localhost:3000').split(',').map(s => s.trim());

// CORS: allow requests from configured origins. For unknown origins, deny gracefully
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (FRONTEND_ORIGINS.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    // Deny the origin without throwing an exception (so server stays up)
    return callback(null, false);
  },
  credentials: true,
}));

logger.info('Allowed CORS origins:', FRONTEND_ORIGINS.join(','));
// Limit incoming JSON bodies to prevent huge uploads from crashing the server.
// Increase default to 1mb because registration payloads (education/work/projects) can be larger.
const BODY_LIMIT = process.env.BODY_LIMIT || '1mb';
app.use(express.json({ limit: BODY_LIMIT }));

// Routes
app.use('/auth', authRoutes);
app.use('/student', require('./routes/studentRoutes'));
app.use('/users', require('./routes/userRoutes'));
app.use('/companies', require('./routes/companyRoutes'));

const PORT = process.env.PORT || 3000;

initDb()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('Failed to initialize DB:', err);
    process.exit(1);
  });

// Error handler for payload-too-large and other body-parser errors
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.too.large') {
    const addr = req.ip || (req.connection && req.connection.remoteAddress) || 'unknown';
    const len = req.get && req.get('Content-Length');
    logger.warn('Payload too large:', addr, req.originalUrl || req.url, 'Content-Length=', len || 'unknown');
    return res.status(413).json({ message: 'Payload too large' });
  }
  // fallback to default error handler
  next(err);
});
