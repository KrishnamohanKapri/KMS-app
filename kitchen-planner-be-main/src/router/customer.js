const express = require("express");
const router = express.Router();
const {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  getCustomerByUserId,
  updateCustomer,
  updateBillingInfo,
  updatePreferences,
  addLoyaltyPoints,
  getCustomerStats,
  deleteCustomer,
} = require("../controllers/customerController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

// Public routes (if needed)
// router.post("/", createCustomer);

// Protected routes
router.post("/", isAuthenticated, createCustomer);
router.get("/", isAuthenticated, isAdmin, getAllCustomers);
router.get("/stats", isAuthenticated, isAdmin, getCustomerStats);
router.get("/:id", isAuthenticated, getCustomerById);
router.get("/user/:userId", isAuthenticated, getCustomerByUserId);
router.put("/:id", isAuthenticated, updateCustomer);
router.put("/:id/billing", isAuthenticated, updateBillingInfo);
router.put("/:id/preferences", isAuthenticated, updatePreferences);
router.post("/:id/loyalty-points", isAuthenticated, isAdmin, addLoyaltyPoints);
router.delete("/:id", isAuthenticated, isAdmin, deleteCustomer);

module.exports = router; 