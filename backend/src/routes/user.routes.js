const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// Get all users - admin only
router.get('/', protect, authorize('admin'), userController.getAllUsers);

// Get user by ID - admin only
router.get('/:id', protect, authorize('admin'), userController.getUserById);

// Update user profile
router.put(
  '/profile',
  protect,
  [
    body('first_name').optional().notEmpty().withMessage('First name cannot be empty'),
    body('last_name').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('phone').optional(),
  ],
  validateRequest,
  userController.updateProfile
);

// Get farmer profile
router.get('/farmer/:id', userController.getFarmerProfile);

// Update farmer profile
router.put(
  '/farmer/profile',
  protect,
  authorize('farmer'),
  [
    body('farm_name').optional().notEmpty().withMessage('Farm name cannot be empty'),
    body('description').optional(),
    body('location').optional().notEmpty().withMessage('Location cannot be empty'),
    body('website').optional(),
  ],
  validateRequest,
  userController.updateFarmerProfile
);

// Get consumer profile
router.get('/consumer/profile', protect, authorize('consumer'), userController.getConsumerProfile);

// Update consumer profile
router.put(
  '/consumer/profile',
  protect,
  authorize('consumer'),
  [
    body('preferences').optional().isObject().withMessage('Preferences must be an object'),
  ],
  validateRequest,
  userController.updateConsumerProfile
);

// Get user addresses
router.get('/addresses', protect, userController.getUserAddresses);

// Add address
router.post(
  '/addresses',
  protect,
  [
    body('name').notEmpty().withMessage('Address name is required'),
    body('street_address').notEmpty().withMessage('Street address is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('postal_code').notEmpty().withMessage('Postal code is required'),
    body('country').notEmpty().withMessage('Country is required'),
  ],
  validateRequest,
  userController.addAddress
);

// Update address
router.put(
  '/addresses/:id',
  protect,
  [
    body('name').optional().notEmpty().withMessage('Address name cannot be empty'),
    body('street_address').optional().notEmpty().withMessage('Street address cannot be empty'),
    body('city').optional().notEmpty().withMessage('City cannot be empty'),
    body('state').optional().notEmpty().withMessage('State cannot be empty'),
    body('postal_code').optional().notEmpty().withMessage('Postal code cannot be empty'),
    body('country').optional().notEmpty().withMessage('Country cannot be empty'),
  ],
  validateRequest,
  userController.updateAddress
);

// Delete address
router.delete('/addresses/:id', protect, userController.deleteAddress);

// Set default address
router.put('/addresses/:id/default', protect, userController.setDefaultAddress);

module.exports = router;
