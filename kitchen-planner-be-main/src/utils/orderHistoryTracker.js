/**
 * Order History Tracker Utility
 * Automatically creates order history entries when order status changes
 */

const OrderHistory = require("../models/User/orderHistory");

// Debug: Check if OrderHistory model is loaded correctly
console.log('🔍 OrderHistory model loaded:', !!OrderHistory);
console.log('🔍 OrderHistory model type:', typeof OrderHistory);
if (OrderHistory) {
  console.log('🔍 OrderHistory collection name:', OrderHistory.collection.name);
}

class OrderHistoryTracker {
  /**
   * Create a new order history entry
   * @param {Object} orderData - Order data
   * @param {string} newStatus - New status
   * @param {string} previousStatus - Previous status (optional)
   * @param {ObjectId} changedBy - User who made the change
   * @param {string} notes - Optional notes
   * @returns {Promise<Object>} Created history entry
   */
  static async createHistoryEntry(orderData, newStatus, previousStatus, changedBy, notes = "") {
    try {
      const historyEntry = new OrderHistory({
        orderId: orderData._id,
        userId: orderData.user, // Corrected from orderData.userId
        status: newStatus,
        previousStatus: previousStatus, // Now can be undefined for initial entry
        orderNumber: orderData.orderNumber || `ORD-${orderData._id.toString().slice(-6)}`,
        totalAmount: orderData.total, // Corrected from orderData.totalAmount
        changedBy: changedBy,
        notes: notes,
        changedAt: new Date()
      });

      const savedEntry = await historyEntry.save();
      return savedEntry;
    } catch (error) {
      console.error("Error creating order history entry:", error);
      throw error;
    }
  }

  /**
   * Create initial history entry when order is first created
   * @param {Object} orderData - New order data
   * @param {ObjectId} createdBy - User who created the order
   * @returns {Promise<Object>} Created history entry
   */
  static async createInitialEntry(orderData, createdBy) {
    return await this.createHistoryEntry(
      orderData,
      "pending",
      null, // Pass null for initial entry
      createdBy,
      "Order created"
    );
  }

  /**
   * Update order status and create history entry
   * @param {Object} orderData - Order data
   * @param {string} newStatus - New status
   * @param {ObjectId} changedBy - User who made the change
   * @param {string} notes - Optional notes
   * @returns {Promise<Object>} Created history entry
   */
  static async updateOrderStatus(orderData, newStatus, changedBy, notes = "") {
    const previousStatus = orderData.status;
    
    return await this.createHistoryEntry(
      orderData,
      newStatus,
      previousStatus,
      changedBy,
      notes
    );
  }

  /**
   * Get order history for a specific order
   * @param {ObjectId} orderId - Order ID
   * @param {number} limit - Number of entries to return (default: 50)
   * @returns {Promise<Array>} Array of history entries
   */
  static async getOrderHistory(orderId, limit = 50) {
    try {
      console.log('🔍 OrderHistoryTracker.getOrderHistory called with:', { orderId, limit });
      console.log('🔍 orderId type:', typeof orderId);
      console.log('🔍 orderId length:', orderId ? orderId.length : 'undefined');
      
      const history = await OrderHistory.find({ orderId })
        .populate('changedBy', 'firstName lastName email')
        .sort({ changedAt: -1 })
        .limit(limit);

      console.log('✅ OrderHistory query successful, found:', history.length, 'entries');
      return history;
    } catch (error) {
      console.error("❌ Error fetching order history:", error);
      console.error("❌ Error stack:", error.stack);
      throw error;
    }
  }

  /**
   * Get user's order history
   * @param {ObjectId} userId - User ID
   * @param {number} limit - Number of entries to return (default: 50)
   * @returns {Promise<Array>} Array of history entries
   */
  static async getUserOrderHistory(userId, limit = 50) {
    try {
      const history = await OrderHistory.find({ userId })
        .populate('changedBy', 'firstName lastName email')
        .sort({ changedAt: -1 })
        .limit(limit);

      return history;
    } catch (error) {
      console.error("Error fetching user order history:", error);
      throw error;
    }
  }

  /**
   * Get recent order history by status
   * @param {string} status - Order status
   * @param {number} limit - Number of entries to return (default: 50)
   * @returns {Promise<Array>} Array of history entries
   */
  static async getRecentHistoryByStatus(status, limit = 50) {
    try {
      const history = await OrderHistory.find({ status })
        .populate('changedBy', 'firstName lastName email')
        .populate('userId', 'firstName lastName email')
        .sort({ changedAt: -1 })
        .limit(limit);

      return history;
    } catch (error) {
      console.error("Error fetching recent history by status:", error);
      throw error;
    }
  }

  /**
   * Get order timeline (chronological order)
   * @param {ObjectId} orderId - Order ID
   * @returns {Promise<Array>} Array of history entries in chronological order
   */
  static async getOrderTimeline(orderId) {
    try {
      const timeline = await OrderHistory.find({ orderId })
        .populate('changedBy', 'firstName lastName email')
        .sort({ changedAt: 1 }); // Chronological order

      return timeline;
    } catch (error) {
      console.error("Error fetching order timeline:", error);
      throw error;
    }
  }

  /**
   * Get order statistics
   * @param {ObjectId} orderId - Order ID
   * @returns {Promise<Object>} Order statistics
   */
  static async getOrderStatistics(orderId) {
    try {
      const history = await OrderHistory.find({ orderId }).sort({ changedAt: 1 });
      
      if (history.length === 0) {
        return null;
      }

      const firstEntry = history[0];
      const lastEntry = history[history.length - 1];
      const totalTime = lastEntry.changedAt - firstEntry.changedAt;
      const timeInMinutes = Math.floor(totalTime / 60000);

      return {
        orderId: orderId,
        totalStatusChanges: history.length,
        firstStatus: firstEntry.status,
        currentStatus: lastEntry.status,
        orderCreatedAt: firstEntry.changedAt,
        lastUpdatedAt: lastEntry.changedAt,
        totalProcessingTime: timeInMinutes,
        statusTimeline: history.map(entry => ({
          status: entry.status,
          changedAt: entry.changedAt,
          changedBy: entry.changedBy,
          notes: entry.notes
        }))
      };
    } catch (error) {
      console.error("Error fetching order statistics:", error);
      throw error;
    }
  }

  /**
   * Get recent activity across all orders
   * @param {number} limit - Number of entries to return (default: 20)
   * @returns {Promise<Array>} Array of recent history entries
   */
  static async getRecentActivity(limit = 20) {
    try {
      const activity = await OrderHistory.find()
        .populate('changedBy', 'firstName lastName email')
        .populate('userId', 'firstName lastName email')
        .sort({ changedAt: -1 })
        .limit(limit);

      return activity;
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      throw error;
    }
  }
}

module.exports = OrderHistoryTracker;