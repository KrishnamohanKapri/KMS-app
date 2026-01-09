const express = require("express");
const order = require("../controllers/orderController.js");
const { isAuthenticated } = require("../middleware/auth");
const { updateDeliveryPersonAddressForOrder, getDeliveryPersonAddressForOrder } = require("../controllers/deliveryController.js");
const router = express.Router();

router.route("/").get(isAuthenticated, order.getAllOrders);
router.route("/delivery-location").post(isAuthenticated, updateDeliveryPersonAddressForOrder);
router.route("/delivery-location/:orderId").get(isAuthenticated, getDeliveryPersonAddressForOrder);
router.route("/:id").get(isAuthenticated, order.getOrder);
router.route("/cart/checkout").post(order.checkout);
router.route("/").post(isAuthenticated, order.createOrder);
router.route("/update-status/:id").put(isAuthenticated, order.updateOrderStatus);

module.exports = router;
