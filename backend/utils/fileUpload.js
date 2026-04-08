const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, '../uploads/profile_photos');
const ensureUploadDir = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
};

// Only call once on module load
ensureUploadDir();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadDir();
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

// File filter for image types only
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
  const allowedExts = ['.jpg', '.jpeg', '.png'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpg, .jpeg, and .png files are allowed'));
  }
};

// Create multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

// Helper to delete a file
const deleteFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch (err) {
    console.error('Error deleting file:', err);
  }
  return false;
};

// Helper to construct file URL
const getFileUrl = (filename) => {
  if (!filename) return null;
  const baseUrl = process.env.FILE_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/uploads/profile_photos/${filename}`;
};

// Helper to extract filename from URL
const extractFilenameFromUrl = (url) => {
  if (!url) return null;
  const match = url.match(/\/profile_photos\/([^\/\?]+)/);
  return match ? match[1] : null;
};

// Helper to get full file path from filename
const getFullFilePath = (filename) => {
  return path.join(UPLOAD_DIR, filename);
};

module.exports = {
  upload,
  deleteFile,
  getFileUrl,
  extractFilenameFromUrl,
  getFullFilePath,
  UPLOAD_DIR,
  ensureUploadDir
};
