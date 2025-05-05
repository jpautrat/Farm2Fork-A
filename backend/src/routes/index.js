const express = require('express');
const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const orderRoutes = require('./order.routes');
const userRoutes = require('./user.routes');
const paymentRoutes = require('./payment.routes');
const shippingRoutes = require('./shipping.routes');
const uploadRoutes = require('./upload.routes');

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes);
router.use('/payments', paymentRoutes);
router.use('/shipping', shippingRoutes);
router.use('/upload', uploadRoutes);

module.exports = router;
