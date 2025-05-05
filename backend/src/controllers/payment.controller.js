const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const supabase = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Create payment intent
 * @route POST /api/payments/create-payment-intent
 * @access Private
 */
const createPaymentIntent = async (req, res, next) => {
  try {
    const { order_id } = req.body;

    // Get order
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !order) {
      return next(new AppError('Order not found', 404));
    }

    // Check if order is already paid
    const { data: existingPayment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', order_id)
      .eq('status', 'completed')
      .single();

    if (existingPayment) {
      return next(new AppError('Order is already paid', 400));
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total_amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        order_id: order.id,
        user_id: req.user.id,
      },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    logger.error('Error creating payment intent:', error);
    next(error);
  }
};

/**
 * Process payment
 * @route POST /api/payments/process
 * @access Private
 */
const processPayment = async (req, res, next) => {
  try {
    const { order_id, payment_method, payment_intent_id } = req.body;

    // Get order
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !order) {
      return next(new AppError('Order not found', 404));
    }

    // Check if order is already paid
    const { data: existingPayment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', order_id)
      .eq('status', 'completed')
      .single();

    if (existingPayment) {
      return next(new AppError('Order is already paid', 400));
    }

    // Retrieve payment intent to verify status
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status !== 'succeeded') {
      return next(new AppError('Payment has not been completed', 400));
    }

    // Create payment record
    const { data: payment, error: createError } = await supabase
      .from('payments')
      .insert([
        {
          order_id,
          amount: order.total_amount,
          payment_method,
          status: 'completed',
          transaction_id: payment_intent_id,
        },
      ])
      .select()
      .single();

    if (createError) {
      logger.error('Error creating payment record:', createError);
      return next(new AppError('Error processing payment', 500));
    }

    // Update order status to processing
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'processing',
        updated_at: new Date(),
      })
      .eq('id', order_id);

    if (updateError) {
      logger.error('Error updating order status:', updateError);
      // We don't want to fail the request if this update fails
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    logger.error('Error processing payment:', error);
    next(error);
  }
};

/**
 * Stripe webhook
 * @route POST /api/payments/webhook
 * @access Public
 */
const stripeWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;

    // Verify webhook signature
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody, // Note: Express needs to be configured to expose raw body for this
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      logger.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      default:
        logger.info(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

/**
 * Handle payment intent succeeded event
 */
const handlePaymentIntentSucceeded = async (paymentIntent) => {
  try {
    const { order_id } = paymentIntent.metadata;

    if (!order_id) {
      logger.error('No order_id in payment intent metadata');
      return;
    }

    // Check if payment record already exists
    const { data: existingPayment, error: checkError } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', order_id)
      .eq('transaction_id', paymentIntent.id)
      .single();

    if (existingPayment) {
      // Payment already processed
      return;
    }

    // Get order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      logger.error('Order not found for payment intent:', paymentIntent.id);
      return;
    }

    // Create payment record
    const { error: createError } = await supabase
      .from('payments')
      .insert([
        {
          order_id,
          amount: order.total_amount,
          payment_method: 'stripe',
          status: 'completed',
          transaction_id: paymentIntent.id,
        },
      ]);

    if (createError) {
      logger.error('Error creating payment record from webhook:', createError);
      return;
    }

    // Update order status to processing
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'processing',
        updated_at: new Date(),
      })
      .eq('id', order_id);

    if (updateError) {
      logger.error('Error updating order status from webhook:', updateError);
    }
  } catch (error) {
    logger.error('Error handling payment_intent.succeeded:', error);
  }
};

/**
 * Handle payment intent failed event
 */
const handlePaymentIntentFailed = async (paymentIntent) => {
  try {
    const { order_id } = paymentIntent.metadata;

    if (!order_id) {
      logger.error('No order_id in payment intent metadata');
      return;
    }

    // Create failed payment record
    const { error: createError } = await supabase
      .from('payments')
      .insert([
        {
          order_id,
          amount: paymentIntent.amount / 100, // Convert from cents
          payment_method: 'stripe',
          status: 'failed',
          transaction_id: paymentIntent.id,
        },
      ]);

    if (createError) {
      logger.error('Error creating failed payment record from webhook:', createError);
    }
  } catch (error) {
    logger.error('Error handling payment_intent.payment_failed:', error);
  }
};

module.exports = {
  createPaymentIntent,
  processPayment,
  stripeWebhook,
};
