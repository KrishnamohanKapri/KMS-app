const express = require("express");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const router = express.Router();
const meals = require("../controllers/mealController");
const { uploadMealImage, handleUploadError, cleanupUploadedFiles } = require("../middleware/uploadMiddleware");

// Basic meal routes
router.route("/").get(meals.getAllMeals);
router.route("/").post(isAuthenticated, isAdmin, uploadMealImage, handleUploadError, cleanupUploadedFiles, meals.createMeal);
router.route("/:id").get(meals.getMeal);
router.route("/:id").put(isAuthenticated, isAdmin, uploadMealImage, handleUploadError, cleanupUploadedFiles, meals.updateMeal);
router.route("/:id").delete(isAuthenticated, isAdmin, meals.deleteMeal);

// Image management routes
router.route("/:id/image").post(isAuthenticated, isAdmin, uploadMealImage, handleUploadError, cleanupUploadedFiles, meals.uploadMealImage);
router.route("/:mealId/image/:imageId").delete(isAuthenticated, isAdmin, meals.deleteMealImage);

// category routes
router.route("/category/get").get(meals.getAllCategories);
router.route("/category").post(isAuthenticated, isAdmin, meals.createCategory);
router
  .route("/category/:id")
  .put(isAuthenticated, isAdmin, meals.updateCategory);

module.exports = router;
