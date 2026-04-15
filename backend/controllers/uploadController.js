const { uploadProfilePic, uploadResume } = require('../utils/azureStorage');
const logger = require('../utils/logger');
const { pool } = require('../config/db');

async function uploadProfilePicController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No profile picture selected.' });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Only JPEG, PNG, and WebP images are allowed.' });
    }

    const userId = req.user?.id || req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const url = await uploadProfilePic(req.file, userId);

    try {
      await pool.execute('UPDATE tbl_cp_student SET profile_photo_url = ? WHERE student_id = ?', [url, userId]);
    } catch (err) {
      logger.warn('Failed to update DB with profile_photo_url:', err.message);  
    }

    logger.info('Profile picture uploaded successfully: ' + url);
    return res.status(200).json({ success: true, url, message: 'Profile picture uploaded.' });
  } catch (error) {
    logger.error('uploadProfilePicController Error:', error);
    return res.status(500).json({ error: 'Upload failed', details: error.message });
  }
}

async function uploadResumeController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume selected.' });
    }

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Only PDF and Word documents are allowed.' });
    }

    const userId = req.user?.id || req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const url = await uploadResume(req.file, userId);

    try {
      await pool.execute('UPDATE tbl_cp_student SET resume_url = ? WHERE student_id = ?', [url, userId]);
    } catch (err) {
      logger.warn('Failed to update DB with resume url:', err.message);       
    }

    logger.info('Resume uploaded successfully: ' + url);
    return res.status(200).json({ success: true, url, message: 'Resume uploaded.' });
  } catch (error) {
    logger.error('uploadResumeController Error:', error);
    return res.status(500).json({ error: 'Upload failed', details: error.message });
  }
}

module.exports = {
  uploadProfilePicController,
  uploadResumeController
};
