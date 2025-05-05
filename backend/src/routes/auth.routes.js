const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const { strictLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// Register user
router.post(
  '/register',
  strictLimiter,
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
    body('role')
      .isIn(['farmer', 'consumer'])
      .withMessage('Role must be either farmer or consumer'),
  ],
  validateRequest,
  authController.register
);

// Login user
router.post(
  '/login',
  strictLimiter,
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  authController.login
);

// Get current user
router.get('/me', protect, authController.getMe);

// Update password
router.put(
  '/update-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long'),
  ],
  validateRequest,
  authController.updatePassword
);

// Forgot password
router.post(
  '/forgot-password',
  strictLimiter,
  [body('email').isEmail().withMessage('Please provide a valid email')],
  validateRequest,
  authController.forgotPassword
);

// Reset password
router.put(
  '/reset-password/:resetToken',
  strictLimiter,
  [
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  validateRequest,
  authController.resetPassword
);

module.exports = router;
