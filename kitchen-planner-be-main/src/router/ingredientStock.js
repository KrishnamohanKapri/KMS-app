const express = require("express");
const router = express.Router();
const {
  getAllIngredientsWithStock,
  updateIngredientStock,
  addStock,
  addStockWithBatch,
  getLowStockIngredients,
  getOutOfStockIngredients,
  getMealAvailability,
  getStockReport,
  addIngredientBatch,
  getIngredientBatches,
  getExpiringBatches,
  deductStockFromBatches,
  cleanupExpiredBatches
} = require("../controllers/ingredientStockController");

const { isAuthenticated, isAdmin } = require("../middleware/auth");

// Stock management routes
router.get("/ingredients/stock", isAuthenticated, isAdmin, getAllIngredientsWithStock);
router.put("/ingredients/:ingredientId/stock", isAuthenticated, isAdmin, updateIngredientStock);
router.post("/ingredients/:ingredientId/add-stock", isAuthenticated, isAdmin, addStock);
router.post("/ingredients/:ingredientId/add-stock-with-batch", isAuthenticated, isAdmin, addStockWithBatch);
router.post("/ingredients/:ingredientId/deduct-stock", isAuthenticated, isAdmin, deductStockFromBatches);

// Batch management routes
router.post("/ingredients/:ingredientId/batches", isAuthenticated, isAdmin, addIngredientBatch);
router.get("/ingredients/:ingredientId/batches", isAuthenticated, isAdmin, getIngredientBatches);
router.get("/batches/expiring", isAuthenticated, isAdmin, getExpiringBatches);
router.post("/batches/cleanup-expired", isAuthenticated, isAdmin, cleanupExpiredBatches);

// Stock monitoring routes
router.get("/ingredients/low-stock", isAuthenticated, isAdmin, getLowStockIngredients);
router.get("/ingredients/out-of-stock", isAuthenticated, isAdmin, getOutOfStockIngredients);
router.get("/meals/:mealId/availability", getMealAvailability);
router.get("/stock/report", isAuthenticated, isAdmin, getStockReport);

module.exports = router; 