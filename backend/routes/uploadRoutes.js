const express = require('express');
const router = express.Router();
const multer = require('multer');

const { uploadProfilePicController, uploadResumeController } = require('../controllers/uploadController');
const { authenticate } = require('../middleware/auth'); 

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit 
});

router.post('/profile-pic', authenticate, upload.single('file'), uploadProfilePicController);
router.post('/resume', authenticate, upload.single('file'), uploadResumeController);

module.exports = router;
