const express = require('express');
const multer = require('multer');
const uploadController = require('../controllers/upload.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Upload image
router.post('/image', protect, upload.single('image'), uploadController.uploadImage);

module.exports = router;
