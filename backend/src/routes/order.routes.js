const express = require('express');
const { body } = require('express-validator');
const orderController = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// Get all orders - admin only
router.get('/', protect, authorize('admin'), orderController.getAllOrders);

// Get user orders - for logged in user
router.get('/my-orders', protect, orderController.getUserOrders);

// Get farmer orders - for logged in farmer
router.get('/farmer-orders', protect, authorize('farmer'), orderController.getFarmerOrders);

// Get single order
router.get('/:id', protect, orderController.getOrder);

// Create order
router.post(
  '/',
  protect,
  [
    body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('items.*.product_id').notEmpty().withMessage('Product ID is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('shipping_address_id').notEmpty().withMessage('Shipping address is required'),
  ],
  validateRequest,
  orderController.createOrder
);

// Update order status - admin or farmer only
router.put(
  '/:id/status',
  protect,
  authorize('admin', 'farmer'),
  [
    body('status')
      .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid status'),
  ],
  validateRequest,
  orderController.updateOrderStatus
);

// Cancel order - user can cancel their own order
router.put('/:id/cancel', protect, orderController.cancelOrder);

module.exports = router;
