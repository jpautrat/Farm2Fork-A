const EasyPost = require('@easypost/api');
const supabase = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Initialize EasyPost client
const api = new EasyPost(process.env.EASYPOST_API_KEY);

/**
 * Calculate shipping rates
 * @route POST /api/shipping/calculate-rates
 * @access Private
 */
const calculateRates = async (req, res, next) => {
  try {
    const { address, items } = req.body;

    // Create to address
    const toAddress = new api.Address({
      name: address.name,
      street1: address.street_address,
      city: address.city,
      state: address.state,
      zip: address.postal_code,
      country: address.country,
    });

    // Create from address (farm address - hardcoded for demo)
    const fromAddress = new api.Address({
      company: 'Farm2Fork',
      street1: '123 Farm Road',
      city: 'Farmville',
      state: 'CA',
      zip: '94107',
      country: 'US',
    });

    // Calculate parcel dimensions based on items
    // This is a simplified calculation - in a real app, you would use actual product dimensions
    const totalWeight = items.reduce((sum, item) => sum + (item.quantity * 0.5), 0); // Assuming 0.5 lb per item
    
    const parcel = new api.Parcel({
      length: 12,
      width: 8,
      height: 6,
      weight: Math.max(totalWeight, 1), // Minimum 1 lb
    });

    // Create shipment
    const shipment = new api.Shipment({
      to_address: toAddress,
      from_address: fromAddress,
      parcel: parcel,
    });

    await shipment.save();

    // Return available rates
    res.status(200).json({
      success: true,
      data: {
        shipment_id: shipment.id,
        rates: shipment.rates.map(rate => ({
          id: rate.id,
          carrier: rate.carrier,
          service: rate.service,
          rate: rate.rate,
          delivery_days: rate.delivery_days,
          delivery_date: rate.delivery_date,
        })),
      },
    });
  } catch (error) {
    logger.error('Error calculating shipping rates:', error);
    next(new AppError('Error calculating shipping rates', 500));
  }
};

/**
 * Create shipping label
 * @route POST /api/shipping/create-label
 * @access Private
 */
const createLabel = async (req, res, next) => {
  try {
    const { order_id, rate_id } = req.body;

    // Get order
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        shipping_address:shipping_address_id(*)
      `)
      .eq('id', order_id)
      .single();

    if (error || !order) {
      return next(new AppError('Order not found', 404));
    }

    // Check if user is authorized to create label
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return next(new AppError('Not authorized to create label for this order', 403));
    }

    // Create to address
    const toAddress = new api.Address({
      name: `${order.shipping_address.name}`,
      street1: order.shipping_address.street_address,
      city: order.shipping_address.city,
      state: order.shipping_address.state,
      zip: order.shipping_address.postal_code,
      country: order.shipping_address.country,
    });

    // Create from address (farm address - hardcoded for demo)
    const fromAddress = new api.Address({
      company: 'Farm2Fork',
      street1: '123 Farm Road',
      city: 'Farmville',
      state: 'CA',
      zip: '94107',
      country: 'US',
    });

    // Get order items
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order_id);

    if (itemsError) {
      return next(new AppError('Error fetching order items', 500));
    }

    // Calculate parcel dimensions based on items
    const totalWeight = orderItems.reduce((sum, item) => sum + (item.quantity * 0.5), 0);
    
    const parcel = new api.Parcel({
      length: 12,
      width: 8,
      height: 6,
      weight: Math.max(totalWeight, 1), // Minimum 1 lb
    });

    // Create shipment
    const shipment = new api.Shipment({
      to_address: toAddress,
      from_address: fromAddress,
      parcel: parcel,
    });

    await shipment.save();

    // Buy the rate
    const boughtShipment = await api.Shipment.retrieve(shipment.id);
    const rate = boughtShipment.rates.find(r => r.id === rate_id);

    if (!rate) {
      return next(new AppError('Rate not found', 404));
    }

    await boughtShipment.buy(rate);

    // Update order with tracking information
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        tracking_number: boughtShipment.tracking_code,
        status: 'shipped',
        updated_at: new Date(),
      })
      .eq('id', order_id);

    if (updateError) {
      logger.error('Error updating order with tracking information:', updateError);
    }

    res.status(200).json({
      success: true,
      data: {
        tracking_number: boughtShipment.tracking_code,
        label_url: boughtShipment.postage_label.label_url,
        tracking_url: `https://track.easypost.com/${boughtShipment.tracking_code}`,
      },
    });
  } catch (error) {
    logger.error('Error creating shipping label:', error);
    next(new AppError('Error creating shipping label', 500));
  }
};

/**
 * Track shipment
 * @route GET /api/shipping/track/:tracking_number
 * @access Public
 */
const trackShipment = async (req, res, next) => {
  try {
    const { tracking_number } = req.params;

    // Create tracker
    const tracker = new api.Tracker({
      tracking_code: tracking_number,
    });

    await tracker.save();

    res.status(200).json({
      success: true,
      data: {
        carrier: tracker.carrier,
        tracking_number: tracker.tracking_code,
        status: tracker.status,
        estimated_delivery_date: tracker.est_delivery_date,
        tracking_details: tracker.tracking_details,
      },
    });
  } catch (error) {
    logger.error('Error tracking shipment:', error);
    next(new AppError('Error tracking shipment', 500));
  }
};

module.exports = {
  calculateRates,
  createLabel,
  trackShipment,
};
