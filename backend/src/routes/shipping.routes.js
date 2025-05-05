const express = require('express');
const { body } = require('express-validator');
const shippingController = require('../controllers/shipping.controller');
const { protect } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// Calculate shipping rates
router.post(
  '/calculate-rates',
  protect,
  [
    body('address').notEmpty().withMessage('Address is required'),
    body('items').isArray({ min: 1 }).withMessage('Items are required'),
  ],
  validateRequest,
  shippingController.calculateRates
);

// Create shipping label
router.post(
  '/create-label',
  protect,
  [
    body('order_id').notEmpty().withMessage('Order ID is required'),
    body('rate_id').notEmpty().withMessage('Rate ID is required'),
  ],
  validateRequest,
  shippingController.createLabel
);

// Track shipment
router.get('/track/:tracking_number', shippingController.trackShipment);

module.exports = router;
