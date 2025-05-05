const logger = require('../utils/logger');

/**
 * Notification service for sending real-time notifications
 */
class NotificationService {
  constructor(io) {
    this.io = io;
  }

  /**
   * Send notification to a specific user
   * @param {string} userId - User ID to send notification to
   * @param {string} type - Notification type (e.g., 'order_status', 'new_message')
   * @param {object} data - Notification data
   */
  sendToUser(userId, type, data) {
    try {
      this.io.to(userId).emit('notification', {
        type,
        data,
        timestamp: new Date().toISOString(),
      });
      logger.info(`Notification sent to user ${userId}: ${type}`);
    } catch (error) {
      logger.error(`Error sending notification to user ${userId}:`, error);
    }
  }

  /**
   * Send notification to all users with a specific role
   * @param {string} role - User role (e.g., 'admin', 'farmer', 'consumer')
   * @param {string} type - Notification type
   * @param {object} data - Notification data
   */
  sendToRole(role, type, data) {
    try {
      this.io.to(`role:${role}`).emit('notification', {
        type,
        data,
        timestamp: new Date().toISOString(),
      });
      logger.info(`Notification sent to role ${role}: ${type}`);
    } catch (error) {
      logger.error(`Error sending notification to role ${role}:`, error);
    }
  }

  /**
   * Send notification to all connected users
   * @param {string} type - Notification type
   * @param {object} data - Notification data
   */
  sendToAll(type, data) {
    try {
      this.io.emit('notification', {
        type,
        data,
        timestamp: new Date().toISOString(),
      });
      logger.info(`Notification sent to all users: ${type}`);
    } catch (error) {
      logger.error(`Error sending notification to all users:`, error);
    }
  }

  /**
   * Send order status update notification
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID
   * @param {string} status - New order status
   * @param {object} orderData - Additional order data
   */
  sendOrderStatusUpdate(orderId, userId, status, orderData = {}) {
    this.sendToUser(userId, 'order_status_update', {
      order_id: orderId,
      status,
      message: `Your order #${orderId} has been updated to ${status}`,
      ...orderData,
    });
  }
}

module.exports = NotificationService;
