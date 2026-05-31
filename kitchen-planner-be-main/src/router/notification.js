const router = require("express").Router();
const notification = require("../controllers/notificationController.js");
const { isAuthenticated } = require("../middleware/auth");

router.route("/").get(isAuthenticated, notification.getAllNotifications);
router.route("/unread-count").get(isAuthenticated, notification.getUnreadCount);

module.exports = router;