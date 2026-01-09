const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
    },
    meals: {
        type: Array,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "preparing", "ready", "in-delivery" ,"delivered", "cancelled", "refunded"],
        default: "pending",
    },
    total: {
        type: Number,
        required: true,
    },
    subTotal: {
        type: Number,
        required: true,
    },
    tax: {
        type: Number,
        default: 0,
    },
    deliveryFee: {
        type: Number,
        default: 0,
    },
    discount: {
        type: Number,
        default: 0,
    },
    billingInfo: {
        type: Object,
        required: true,
    },
    deliveryAddress: {
        street: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        zipCode: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            default: "United States",
        },
        instructions: {
            type: String,
        },
    },
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
    },
    orderId: {
        type: String,
    },
    estimatedDeliveryTime: {
        type: Date,
    },
    actualDeliveryTime: {
        type: Date,
    },
    specialInstructions: {
        type: String,
    },
}, { timestamps: true });


orderSchema.pre("save", async function (next) {
    // unique order id from prefix and order count
    const prefix = "ORD";
    const count = await Order.countDocuments();
    this.orderId = `${prefix}${count + 1}`;
    next();
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;