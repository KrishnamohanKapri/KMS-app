const express = require("express");
const router = express.Router();
const {
  getOrderHistory,
  getUserOrderHistory,
  getOrderTimeline,
  getOrderStatistics,
  getRecentActivity,
  getRecentHistoryByStatus,
  getOrderHistorySummary,
  searchOrderHistory
} = require("../controllers/orderHistoryController");

const { isAuthenticated, isAdmin } = require("../middleware/auth");

// Order history routes (Admin/Chef access)
router.get("/orders/:orderId/history", isAuthenticated, isAdmin, getOrderHistory);
router.get("/orders/:orderId/timeline", isAuthenticated, isAdmin, getOrderTimeline);
router.get("/orders/:orderId/statistics", isAuthenticated, isAdmin, getOrderStatistics);

// User order history (User can see their own history)
router.get("/users/:userId/history", isAuthenticated, getUserOrderHistory);

// Recent activity and summaries
router.get("/recent-activity", isAuthenticated, isAdmin, getRecentActivity);
router.get("/status/:status", isAuthenticated, isAdmin, getRecentHistoryByStatus);
router.get("/summary", isAuthenticated, isAdmin, getOrderHistorySummary);

// Search order history
router.get("/search", isAuthenticated, isAdmin, searchOrderHistory);

module.exports = router; 