const express = require("express");
const auth = require("../controllers/authController");
const {isAuthenticated} = require("../middleware/auth");
const router = express.Router();

router.route("/register").post(auth.register);
router.route("/login").post(auth.login);
router.route("/profile").get(isAuthenticated, auth.getProfile);
router.route("/profile/:id").put(isAuthenticated, auth.updateProfile);

// Password management routes
router.route("/forgot-password").post(auth.forgotPassword);
router.route("/reset-password/:token").post(auth.resetPassword);
router.route("/change-password").post(isAuthenticated, auth.changePassword);

// Staff management routes (admin only)
router.route("/staff").post(isAuthenticated, auth.createStaffAccount);
router.route("/staff").get(isAuthenticated, auth.getAllStaff);
router.route("/staff/:id").put(isAuthenticated, auth.updateStaffAccount);
router.route("/staff/:id").delete(isAuthenticated, auth.deleteStaffAccount);

module.exports = router;
