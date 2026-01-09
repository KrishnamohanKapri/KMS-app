const express = require("express");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const router = express.Router();
const kitchenRules = require("../controllers/kitchenRulesController");

// Public routes (can be accessed without authentication for viewing rules)
router.route("/").get(kitchenRules.getAllKitchenRules);
router.route("/kitchen/:kitchenId").get(kitchenRules.getKitchenRulesByKitchenId);

// User-specific routes (require authentication, use current user's kitchen)
router.route("/my-kitchen").get(isAuthenticated, kitchenRules.getCurrentUserKitchenRules);
router.route("/my-kitchen").post(isAuthenticated, kitchenRules.createCurrentUserKitchenRules);

// Admin routes (require authentication and admin role)
router.route("/").post(isAuthenticated, isAdmin, kitchenRules.createKitchenRules);
router.route("/:id").put(isAuthenticated, isAdmin, kitchenRules.updateKitchenRules);
router.route("/kitchen/:kitchenId").put(isAuthenticated, isAdmin, kitchenRules.updateKitchenRulesByKitchenId);

// Rule management routes
router.route("/kitchen/:kitchenId/rule").post(isAuthenticated, isAdmin, kitchenRules.addRule);
router.route("/kitchen/:kitchenId/rule/:ruleIndex").delete(isAuthenticated, isAdmin, kitchenRules.removeRule);

// Delete routes (soft delete)
router.route("/:id").delete(isAuthenticated, isAdmin, kitchenRules.deleteKitchenRules);
router.route("/kitchen/:kitchenId").delete(isAuthenticated, isAdmin, kitchenRules.deleteKitchenRulesByKitchenId);

// Hard delete (admin only)
router.route("/:id/hard-delete").delete(isAuthenticated, isAdmin, kitchenRules.hardDeleteKitchenRules);

module.exports = router;
