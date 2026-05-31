const express = require("express");
const router = express.Router();
const {
  createMealPlan,
  getMealPlans,
  getMealPlanById,
  getAvailableMeals,
  checkMealPlanStock,
  checkMealPlanResources,
  deleteMealPlan,
  updateMealPlan
} = require("../controllers/mealPlanController");

const { isAuthenticated, isAdmin } = require("../middleware/auth");

// Meal planning routes
// Allow customers to view meal plans (GET), but only admins can create/modify
router.post("/meal-plans", createMealPlan);
router.get("/meal-plans", getMealPlans); // Removed isAdmin - customers can view
router.get("/meal-plans/:id", getMealPlanById); // Get single meal plan by ID
router.get("/meal-plans/:id/check-stock", isAdmin, checkMealPlanStock);
router.get("/meal-plans/:id/check-resources", isAdmin, checkMealPlanResources);
router.put("/meal-plans/:id", updateMealPlan);
router.delete("/meal-plans/:id", isAdmin, deleteMealPlan);

// Available meals for planning - accessible to everyone
router.get("/available-meals", getAvailableMeals);

module.exports = router; 