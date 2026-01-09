const express = require("express");
const router = express.Router();
const {
  // Allergen controllers
  getAllAllergens,
  createAllergen,
  updateAllergen,
  deleteAllergen,
  
  // Ingredient controllers
  getAllIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  
  // Tag controllers
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
  
  // Meal relationship controllers
  addAllergenToMeal,
  removeAllergenFromMeal,
  addIngredientToMeal,
  updateMealIngredient,
  removeIngredientFromMeal,
  addTagToMeal,
  removeTagFromMeal
} = require("../controllers/normalizedEntitiesController");

const { isAuthenticated, isAdmin } = require("../middleware/auth");

// Allergen routes
router.get("/allergens", getAllAllergens);
router.post("/allergens", isAuthenticated, isAdmin, createAllergen);
router.put("/allergens/:id", isAuthenticated, isAdmin, updateAllergen);
router.delete("/allergens/:id", isAuthenticated, isAdmin, deleteAllergen);

// Ingredient routes
router.get("/ingredients", getAllIngredients);
router.post("/ingredients", isAuthenticated, isAdmin, createIngredient);
router.put("/ingredients/:id", isAuthenticated, isAdmin, updateIngredient);
router.delete("/ingredients/:id", isAuthenticated, isAdmin, deleteIngredient);

// Tag routes
router.get("/tags", getAllTags);
router.post("/tags", isAuthenticated, isAdmin, createTag);
router.put("/tags/:id", isAuthenticated, isAdmin, updateTag);
router.delete("/tags/:id", isAuthenticated, isAdmin, deleteTag);

// Meal relationship routes
router.post("/meals/allergens", isAuthenticated, isAdmin, addAllergenToMeal);
router.delete("/meals/:mealId/allergens/:allergenId", isAuthenticated, isAdmin, removeAllergenFromMeal);

router.post("/meals/ingredients", isAuthenticated, isAdmin, addIngredientToMeal);
router.put("/meals/:mealId/ingredients/:ingredientId", isAuthenticated, isAdmin, updateMealIngredient);
router.delete("/meals/:mealId/ingredients/:ingredientId", isAuthenticated, isAdmin, removeIngredientFromMeal);

router.post("/meals/tags", isAuthenticated, isAdmin, addTagToMeal);
router.delete("/meals/:mealId/tags/:tagId", isAuthenticated, isAdmin, removeTagFromMeal);

module.exports = router; 