const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderHistorySchema = new Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "preparing", "ready", "in-delivery", "delivered", "cancelled"],
    required: true
  },
  previousStatus: {
    type: String,
    enum: ["pending", "confirmed", "preparing", "ready", "in-delivery", "delivered", "cancelled", null],
    default: null
  },
  // Basic order info for quick reference
  orderNumber: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  // Who made the status change
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // Optional notes about the status change
  notes: {
    type: String,
    default: ""
  },
  // Timestamp of the status change
  changedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
orderHistorySchema.index({ orderId: 1, changedAt: -1 });
orderHistorySchema.index({ userId: 1, changedAt: -1 });
orderHistorySchema.index({ status: 1, changedAt: -1 });

// Virtual field to get status change description
orderHistorySchema.virtual('statusChangeDescription').get(function() {
  if (!this.previousStatus) {
    return `Order ${this.status}`;
  }
  return `Order changed from ${this.previousStatus} to ${this.status}`;
});

// Virtual field to get time since change
orderHistorySchema.virtual('timeSinceChange').get(function() {
  const now = new Date();
  const diffMs = now - this.changedAt;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day(s) ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour(s) ago`;
  } else if (diffMins > 0) {
    return `${diffMins} minute(s) ago`;
  } else {
    return 'Just now';
  }
});

// Ensure virtual fields are included when converting to JSON
orderHistorySchema.set('toJSON', { virtuals: true });
orderHistorySchema.set('toObject', { virtuals: true });

const OrderHistory = mongoose.model("OrderHistory", orderHistorySchema);
module.exports = OrderHistory; 