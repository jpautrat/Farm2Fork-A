const express = require('express');
const { body } = require('express-validator');
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// Create payment intent
router.post(
  '/create-payment-intent',
  protect,
  [
    body('order_id').notEmpty().withMessage('Order ID is required'),
  ],
  validateRequest,
  paymentController.createPaymentIntent
);

// Process payment
router.post(
  '/process',
  protect,
  [
    body('order_id').notEmpty().withMessage('Order ID is required'),
    body('payment_method').notEmpty().withMessage('Payment method is required'),
    body('payment_intent_id').notEmpty().withMessage('Payment intent ID is required'),
  ],
  validateRequest,
  paymentController.processPayment
);

// Stripe webhook
router.post('/webhook', paymentController.stripeWebhook);

module.exports = router;
