require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const lookupRoutes = require('./routes/lookupRoutes');
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
// Increase default to 5mb because registration payloads (education/work/projects) can be larger.
const BODY_LIMIT = process.env.BODY_LIMIT || '5mb';
app.use(express.json({ limit: BODY_LIMIT }));
app.use(express.urlencoded({ limit: BODY_LIMIT, extended: true }));

// Routes - All updated to use .js versions with campus6 schema
const companyRoutes = require('./routes/companyRoutes');
const driveRoutes = require('./routes/driveRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const jdRoutes = require('./routes/jdRoutes');
const questionRoutes = require('./routes/questionRoutes');
const roundRoutes = require('./routes/roundRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

app.use('/auth', authRoutes);
app.use('/student', require('./routes/studentRoutes'));
app.use('/users', require('./routes/userRoutes'));
app.use('/companies', companyRoutes);
app.use('/upload', uploadRoutes);
// Resume parser proxy routes
app.use('/resume', resumeRoutes);
app.use('/api/lookup', lookupRoutes);
app.use('/drives', driveRoutes);
app.use('/applications', applicationRoutes);
app.use('/jds', jdRoutes);
app.use('/questions', questionRoutes);
app.use('/rounds', roundRoutes);


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

