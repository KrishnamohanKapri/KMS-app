const express = require("express");
const router = express.Router();
const {
  createPayment,
  getAllPayments,
  getPaymentById,
  getPaymentsByOrderId,
  getPaymentsByCustomerId,
  updatePaymentStatus,
  processRefund,
  getPaymentStats,
  deletePayment,
} = require("../controllers/paymentController");
const {
  createPaymentIntent,
  cancelPaymentIntent,
  refundPaymentIntent,
} = require("../controllers/paymentcontrollerforstripe"); // Import createPaymentIntent and cancelPaymentIntent
const { isAuthenticated, isAdmin } = require("../middleware/auth");

// Protected routes
router.post("/", isAuthenticated, createPayment);
router.post("/stripe/create-payment-intent", isAuthenticated, createPaymentIntent); // New Stripe route
router.get("/", isAuthenticated, isAdmin, getAllPayments);
router.get("/stats", isAuthenticated, isAdmin, getPaymentStats);
router.get("/:id", isAuthenticated, getPaymentById);
router.get("/order/:orderId", isAuthenticated, getPaymentsByOrderId);
router.get("/customer/:customerId", isAuthenticated, getPaymentsByCustomerId);
router.put("/:id/status", isAuthenticated, isAdmin, updatePaymentStatus);
router.post("/:id/refund", isAuthenticated, isAdmin, processRefund);
router.delete("/:id", isAuthenticated, isAdmin, deletePayment);
router.delete("/stripe/intent/:paymentId/cancel", isAuthenticated, isAdmin, cancelPaymentIntent);
router.post("/stripe/intent/:paymentId/refund", isAuthenticated, isAdmin, refundPaymentIntent);

module.exports = router; 