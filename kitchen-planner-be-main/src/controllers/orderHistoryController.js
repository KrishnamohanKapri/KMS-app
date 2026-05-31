const OrderHistory = require("../models/User/orderHistory");
const OrderHistoryTracker = require("../utils/orderHistoryTracker");
const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");

/**
 * Get order history for a specific order
 */
const getOrderHistory = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { limit = 50 } = req.query;

    console.log('🔍 getOrderHistory called with:', { orderId, limit });
    console.log('🔍 orderId type:', typeof orderId);
    console.log('🔍 orderId length:', orderId ? orderId.length : 'undefined');

    const history = await OrderHistoryTracker.getOrderHistory(orderId, parseInt(limit));

    console.log('✅ History retrieved successfully, count:', history.length);

    return SuccessHandler(
      res,
      "Order history retrieved successfully",
      history,
      200
    );
  } catch (error) {
    console.error('❌ Error in getOrderHistory:', error);
    console.error('❌ Error stack:', error.stack);
    return ErrorHandler("Error retrieving order history", 500, req, res);
  }
};

/**
 * Get user's order history
 */
const getUserOrderHistory = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const history = await OrderHistoryTracker.getUserOrderHistory(userId, parseInt(limit));

    return SuccessHandler(
      res,
      "User order history retrieved successfully",
      history,
      200
    );
  } catch (error) {
    return ErrorHandler("Error retrieving user order history", 500, req, res);
  }
};

/**
 * Get order timeline (chronological order)
 */
const getOrderTimeline = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const timeline = await OrderHistoryTracker.getOrderTimeline(orderId);

    return SuccessHandler(
      res,
      "Order timeline retrieved successfully",
      timeline,
      200
    );
  } catch (error) {
    return ErrorHandler("Error retrieving order timeline", 500, req, res);
  }
};

/**
 * Get order statistics
 */
const getOrderStatistics = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const statistics = await OrderHistoryTracker.getOrderStatistics(orderId);

    if (!statistics) {
      return ErrorHandler("Order history not found", 404, req, res);
    }

    return SuccessHandler(
      res,
      "Order statistics retrieved successfully",
      statistics,
      200
    );
  } catch (error) {
    return ErrorHandler("Error retrieving order statistics", 500, req, res);
  }
};

/**
 * Get recent activity across all orders
 */
const getRecentActivity = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    const activity = await OrderHistoryTracker.getRecentActivity(parseInt(limit));

    return SuccessHandler(
      res,
      "Recent activity retrieved successfully",
      activity,
      200
    );
  } catch (error) {
    return ErrorHandler("Error retrieving recent activity", 500, req, res);
  }
};

/**
 * Get recent order history by status
 */
const getRecentHistoryByStatus = async (req, res, next) => {
  try {
    const { status } = req.params;
    const { limit = 50 } = req.query;

    const history = await OrderHistoryTracker.getRecentHistoryByStatus(status, parseInt(limit));

    return SuccessHandler(
      res,
      `Recent ${status} orders retrieved successfully`,
      history,
      200
    );
  } catch (error) {
    return ErrorHandler("Error retrieving recent history by status", 500, req, res);
  }
};

/**
 * Get order history summary (for dashboard)
 */
const getOrderHistorySummary = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get recent activity
    const recentActivity = await OrderHistoryTracker.getRecentActivity(10);

    // Get status counts for the period
    const statusCounts = await OrderHistory.aggregate([
      {
        $match: {
          changedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Get daily activity for the period
    const dailyActivity = await OrderHistory.aggregate([
      {
        $match: {
          changedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$changedAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const summary = {
      recentActivity,
      statusCounts,
      dailyActivity,
      period: `${days} days`
    };

    return SuccessHandler(
      res,
      "Order history summary retrieved successfully",
      summary,
      200
    );
  } catch (error) {
    return ErrorHandler("Error retrieving order history summary", 500, req, res);
  }
};

/**
 * Search order history
 */
const searchOrderHistory = async (req, res, next) => {
  try {
    const { 
      orderNumber, 
      status, 
      userId, 
      changedBy, 
      startDate, 
      endDate,
      limit = 50 
    } = req.query;

    const searchQuery = {};

    if (orderNumber) {
      searchQuery.orderNumber = { $regex: orderNumber, $options: 'i' };
    }

    if (status) {
      searchQuery.status = status;
    }

    if (userId) {
      searchQuery.userId = userId;
    }

    if (changedBy) {
      searchQuery.changedBy = changedBy;
    }

    if (startDate || endDate) {
      searchQuery.changedAt = {};
      if (startDate) {
        searchQuery.changedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        searchQuery.changedAt.$lte = new Date(endDate);
      }
    }

    const history = await OrderHistory.find(searchQuery)
      .populate('changedBy', 'firstName lastName email')
      .populate('userId', 'firstName lastName email')
      .sort({ changedAt: -1 })
      .limit(parseInt(limit));

    return SuccessHandler(
      res,
      "Order history search completed successfully",
      history,
      200
    );
  } catch (error) {
    return ErrorHandler("Error searching order history", 500, req, res);
  }
};

module.exports = {
  getOrderHistory,
  getUserOrderHistory,
  getOrderTimeline,
  getOrderStatistics,
  getRecentActivity,
  getRecentHistoryByStatus,
  getOrderHistorySummary,
  searchOrderHistory
}; 