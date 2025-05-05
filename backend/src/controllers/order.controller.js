const supabase = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const NotificationService = require('../services/notification.service');

/**
 * Get all orders - admin only
 * @route GET /api/orders
 * @access Private (Admin only)
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, sort_by = 'created_at', order = 'desc' } = req.query;

    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build query
    let query = supabase
      .from('orders')
      .select(`
        *,
        user:user_id(id, first_name, last_name, email),
        shipping_address:shipping_address_id(*)
      `, { count: 'exact' });

    // Add status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Add sorting and pagination
    query = query
      .order(sort_by, { ascending: order === 'asc' })
      .range(from, to);

    // Execute query
    const { data: orders, error, count } = await query;

    if (error) {
      logger.error('Error fetching orders:', error);
      return next(new AppError('Error fetching orders', 500));
    }

    // Get order items for each order
    for (const order of orders) {
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          product:product_id(id, name, image, farmer_id)
        `)
        .eq('order_id', order.id);

      if (!itemsError) {
        order.items = orderItems;
      }
    }

    res.status(200).json({
      success: true,
      count,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user orders
 * @route GET /api/orders/my-orders
 * @access Private
 */
const getUserOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, sort_by = 'created_at', order = 'desc' } = req.query;

    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build query
    let query = supabase
      .from('orders')
      .select(`
        *,
        shipping_address:shipping_address_id(*)
      `, { count: 'exact' })
      .eq('user_id', req.user.id);

    // Add status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Add sorting and pagination
    query = query
      .order(sort_by, { ascending: order === 'asc' })
      .range(from, to);

    // Execute query
    const { data: orders, error, count } = await query;

    if (error) {
      logger.error('Error fetching user orders:', error);
      return next(new AppError('Error fetching orders', 500));
    }

    // Get order items for each order
    for (const order of orders) {
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          product:product_id(id, name, image, farmer_id)
        `)
        .eq('order_id', order.id);

      if (!itemsError) {
        order.items = orderItems;
      }
    }

    res.status(200).json({
      success: true,
      count,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get farmer orders
 * @route GET /api/orders/farmer-orders
 * @access Private (Farmers only)
 */
const getFarmerOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, sort_by = 'created_at', order = 'desc' } = req.query;

    // Get farmer profile
    const { data: farmerProfile, error: farmerError } = await supabase
      .from('farmer_profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (farmerError || !farmerProfile) {
      return next(new AppError('Farmer profile not found', 404));
    }

    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Get all order items that contain products from this farmer
    const { data: farmerOrderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        product:product_id(*),
        order:order_id(*)
      `)
      .eq('product.farmer_id', farmerProfile.id);

    if (itemsError) {
      logger.error('Error fetching farmer order items:', itemsError);
      return next(new AppError('Error fetching orders', 500));
    }

    // Extract unique order IDs
    const orderIds = [...new Set(farmerOrderItems.map(item => item.order_id))];

    // Build query to get orders
    let query = supabase
      .from('orders')
      .select(`
        *,
        user:user_id(id, first_name, last_name, email),
        shipping_address:shipping_address_id(*)
      `, { count: 'exact' })
      .in('id', orderIds);

    // Add status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Add sorting and pagination
    query = query
      .order(sort_by, { ascending: order === 'asc' })
      .range(from, to);

    // Execute query
    const { data: orders, error, count } = await query;

    if (error) {
      logger.error('Error fetching farmer orders:', error);
      return next(new AppError('Error fetching orders', 500));
    }

    // Filter order items to only include this farmer's products for each order
    for (const order of orders) {
      order.items = farmerOrderItems
        .filter(item => item.order_id === order.id)
        .map(item => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          product: item.product,
        }));
    }

    res.status(200).json({
      success: true,
      count,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single order
 * @route GET /api/orders/:id
 * @access Private
 */
const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get order with user and shipping address
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:user_id(id, first_name, last_name, email),
        shipping_address:shipping_address_id(*)
      `)
      .eq('id', id)
      .single();

    if (error || !order) {
      return next(new AppError('Order not found', 404));
    }

    // Check if user is authorized to view this order
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      // If user is a farmer, check if they have products in this order
      if (req.user.role === 'farmer') {
        const { data: farmerProfile, error: farmerError } = await supabase
          .from('farmer_profiles')
          .select('id')
          .eq('user_id', req.user.id)
          .single();

        if (farmerError || !farmerProfile) {
          return next(new AppError('Not authorized to view this order', 403));
        }

        // Check if farmer has products in this order
        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            id,
            product:product_id(farmer_id)
          `)
          .eq('order_id', id);

        if (itemsError) {
          return next(new AppError('Error checking order items', 500));
        }

        const hasFarmerProducts = orderItems.some(
          item => item.product && item.product.farmer_id === farmerProfile.id
        );

        if (!hasFarmerProducts) {
          return next(new AppError('Not authorized to view this order', 403));
        }
      } else {
        return next(new AppError('Not authorized to view this order', 403));
      }
    }

    // Get order items
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        product:product_id(*)
      `)
      .eq('order_id', id);

    if (!itemsError) {
      order.items = orderItems;
    }

    // Get payment information
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', id)
      .single();

    if (!paymentError) {
      order.payment = payment;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create order
 * @route POST /api/orders
 * @access Private
 */
const createOrder = async (req, res, next) => {
  try {
    const { items, shipping_address_id, notes } = req.body;

    // Validate shipping address belongs to user
    const { data: address, error: addressError } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', shipping_address_id)
      .eq('user_id', req.user.id)
      .single();

    if (addressError || !address) {
      return next(new AppError('Invalid shipping address', 400));
    }

    // Get product details and calculate totals
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', item.product_id)
        .single();

      if (productError || !product) {
        return next(new AppError(`Product with ID ${item.product_id} not found`, 404));
      }

      // Check if enough stock is available
      if (product.stock_quantity < item.quantity) {
        return next(new AppError(`Not enough stock available for ${product.name}`, 400));
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product_id: product.id,
        quantity: item.quantity,
        unit_price: product.price,
        total_price: itemTotal,
      });
    }

    // Add shipping fee and tax (simplified calculation)
    const shippingFee = 5.99;
    const taxRate = 0.08; // 8% tax
    const taxAmount = totalAmount * taxRate;
    const orderTotal = totalAmount + shippingFee + taxAmount;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: req.user.id,
          status: 'pending',
          total_amount: orderTotal,
          shipping_address_id,
          shipping_fee: shippingFee,
          tax_amount: taxAmount,
          notes,
        },
      ])
      .select()
      .single();

    if (orderError) {
      logger.error('Error creating order:', orderError);
      return next(new AppError('Error creating order', 500));
    }

    // Add order items
    for (const item of orderItems) {
      const { error: itemError } = await supabase
        .from('order_items')
        .insert([
          {
            order_id: order.id,
            ...item,
          },
        ]);

      if (itemError) {
        logger.error('Error adding order item:', itemError);
        // If there's an error, we should ideally roll back the order, but for simplicity we'll just log it
      }

      // Update product stock
      const { error: stockError } = await supabase
        .from('products')
        .update({
          stock_quantity: supabase.raw(`stock_quantity - ${item.quantity}`),
        })
        .eq('id', item.product_id);

      if (stockError) {
        logger.error('Error updating product stock:', stockError);
      }
    }

    // Send real-time notification about new order
    try {
      const io = req.app.get('io');
      if (io) {
        const notificationService = new NotificationService(io);

        // Notify admin about new order
        notificationService.sendToRole(
          'admin',
          'new_order',
          {
            order_id: order.id,
            order_number: order.id.substring(0, 8).toUpperCase(),
            customer: `${req.user.first_name} ${req.user.last_name}`,
            total: orderTotal.toFixed(2),
            message: `New order #${order.id.substring(0, 8).toUpperCase()} has been placed`
          }
        );

        // Get unique farmer IDs from the order items
        const farmerIds = new Set();
        for (const item of orderItems) {
          const { data: product } = await supabase
            .from('products')
            .select('farmer_id')
            .eq('id', item.product_id)
            .single();

          if (product && product.farmer_id) {
            farmerIds.add(product.farmer_id);
          }
        }

        // Notify each farmer about the new order containing their products
        for (const farmerId of farmerIds) {
          const { data: farmer } = await supabase
            .from('farmer_profiles')
            .select('user_id')
            .eq('id', farmerId)
            .single();

          if (farmer && farmer.user_id) {
            notificationService.sendToUser(
              farmer.user_id,
              'new_order',
              {
                order_id: order.id,
                order_number: order.id.substring(0, 8).toUpperCase(),
                message: `New order #${order.id.substring(0, 8).toUpperCase()} contains your products`
              }
            );
          }
        }
      }
    } catch (notificationError) {
      logger.error('Error sending notification:', notificationError);
      // Don't fail the request if notification fails
    }

    res.status(201).json({
      success: true,
      data: {
        ...order,
        items: orderItems,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status
 * @route PUT /api/orders/:id/status
 * @access Private (Admin or Farmer)
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Get order
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !order) {
      return next(new AppError('Order not found', 404));
    }

    // If user is a farmer, check if they have products in this order
    if (req.user.role === 'farmer') {
      const { data: farmerProfile, error: farmerError } = await supabase
        .from('farmer_profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single();

      if (farmerError || !farmerProfile) {
        return next(new AppError('Not authorized to update this order', 403));
      }

      // Check if farmer has products in this order
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          id,
          product:product_id(farmer_id)
        `)
        .eq('order_id', id);

      if (itemsError) {
        return next(new AppError('Error checking order items', 500));
      }

      const hasFarmerProducts = orderItems.some(
        item => item.product && item.product.farmer_id === farmerProfile.id
      );

      if (!hasFarmerProducts) {
        return next(new AppError('Not authorized to update this order', 403));
      }
    }

    // Update order status
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      logger.error('Error updating order status:', updateError);
      return next(new AppError('Error updating order status', 500));
    }

    // Send real-time notification to user about order status update
    try {
      const io = req.app.get('io');
      if (io) {
        const notificationService = new NotificationService(io);
        notificationService.sendOrderStatusUpdate(
          id,
          order.user_id,
          status,
          { order_number: id.substring(0, 8).toUpperCase() }
        );

        // Also notify admin about the status change
        if (req.user.role === 'farmer') {
          notificationService.sendToRole('admin', 'order_status_update', {
            order_id: id,
            status,
            updated_by: `${req.user.first_name} ${req.user.last_name} (Farmer)`,
            message: `Order #${id.substring(0, 8).toUpperCase()} has been updated to ${status} by a farmer`
          });
        }
      }
    } catch (notificationError) {
      logger.error('Error sending notification:', notificationError);
      // Don't fail the request if notification fails
    }

    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel order
 * @route PUT /api/orders/:id/cancel
 * @access Private
 */
const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get order
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !order) {
      return next(new AppError('Order not found', 404));
    }

    // Check if user is authorized to cancel this order
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return next(new AppError('Not authorized to cancel this order', 403));
    }

    // Check if order can be cancelled (only pending or processing orders can be cancelled)
    if (!['pending', 'processing'].includes(order.status)) {
      return next(new AppError(`Order cannot be cancelled in ${order.status} status`, 400));
    }

    // Update order status to cancelled
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        updated_at: new Date(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      logger.error('Error cancelling order:', updateError);
      return next(new AppError('Error cancelling order', 500));
    }

    // Get order items to restore product stock
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id);

    if (!itemsError) {
      // Restore product stock for each item
      for (const item of orderItems) {
        const { error: stockError } = await supabase
          .from('products')
          .update({
            stock_quantity: supabase.raw(`stock_quantity + ${item.quantity}`),
          })
          .eq('id', item.product_id);

        if (stockError) {
          logger.error('Error restoring product stock:', stockError);
        }
      }
    }

    // Send real-time notification about order cancellation
    try {
      const io = req.app.get('io');
      if (io) {
        const notificationService = new NotificationService(io);

        // Notify the customer
        notificationService.sendToUser(
          order.user_id,
          'order_cancelled',
          {
            order_id: id,
            order_number: id.substring(0, 8).toUpperCase(),
            message: `Your order #${id.substring(0, 8).toUpperCase()} has been cancelled`
          }
        );

        // Notify admin
        notificationService.sendToRole(
          'admin',
          'order_cancelled',
          {
            order_id: id,
            order_number: id.substring(0, 8).toUpperCase(),
            cancelled_by: req.user.role === 'admin' ? 'Admin' : 'Customer',
            message: `Order #${id.substring(0, 8).toUpperCase()} has been cancelled`
          }
        );

        // Notify farmers who had products in this order
        const { data: farmerIds } = await supabase
          .from('order_items')
          .select('product:product_id(farmer:farmer_id(user_id))')
          .eq('order_id', id);

        if (farmerIds) {
          const uniqueFarmerUserIds = [...new Set(
            farmerIds
              .map(item => item.product?.farmer?.user_id)
              .filter(Boolean)
          )];

          for (const farmerId of uniqueFarmerUserIds) {
            notificationService.sendToUser(
              farmerId,
              'order_cancelled',
              {
                order_id: id,
                order_number: id.substring(0, 8).toUpperCase(),
                message: `Order #${id.substring(0, 8).toUpperCase()} containing your products has been cancelled`
              }
            );
          }
        }
      }
    } catch (notificationError) {
      logger.error('Error sending notification:', notificationError);
      // Don't fail the request if notification fails
    }

    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllOrders,
  getUserOrders,
  getFarmerOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder,
};
