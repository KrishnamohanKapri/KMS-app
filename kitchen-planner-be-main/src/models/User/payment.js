const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  paymentId: {
    type: String,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: "USD",
    enum: ["USD", "EUR", "GBP", "CAD", "AUD"],
  },
  type: {
    type: String,
    required: true,
    enum: ["paypal", "stripe", "card", "cash", "bank_transfer", "crypto"],
  },
  method: {
    type: String,
    required: true,
    enum: ["credit_card", "debit_card", "paypal_wallet", "stripe_wallet", "bank_transfer", "cash", "crypto_wallet"],
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "processing", "completed", "failed", "refunded", "cancelled"],
    default: "pending",
  },
  paymentDetails: {
    // For card payments
    cardType: {
      type: String,
      enum: ["visa", "mastercard", "amex", "discover", "other"],
    },
    last4Digits: {
      type: String,
      maxlength: 4,
    },
    cardBrand: {
      type: String,
      // The type of card, e.g., credit, debit, or prepaid.
      enum: ["credit", "debit", "prepaid", "unknown"], // This will now be stored in 'cardBrand'
    },
    // For PayPal/Stripe
    transactionId: {
      type: String,
    },
    paymentIntentId: {
      type: String,
    },
    clientSecret: {
      type: String,
    },
    receiptUrl: {
      type: String,
    },
    paymentSource: {
      type: Object, // To store PayPal's payment_source object
    },
    // For bank transfers
    bankName: {
      type: String,
    },
    accountNumber: {
      type: String,
    },
    routingNumber: {
      type: String,
    },
    // For crypto
    cryptoType: {
      type: String,
      enum: ["bitcoin", "ethereum", "litecoin", "other"],
    },
    walletAddress: {
      type: String,
    },
  },
  billingAddress: {
    street: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    zipCode: {
      type: String,
    },
    country: {
      type: String,
    },
  },
  fees: {
    processingFee: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
  },
  metadata: {
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    deviceType: {
      type: String,
      enum: ["mobile", "desktop", "tablet"],
    },
    location: {
      type: String,
    },
  },
  refundInfo: {
    refundedAmount: {
      type: Number,
      default: 0,
    },
    refundReason: {
      type: String,
    },
    refundedAt: {
      type: Date,
    },
    refundTransactionId: {
      type: String,
    },
  },
  notes: {
    type: String,
  },
}, { timestamps: true });

// Generate unique payment ID before saving
paymentSchema.pre("save", async function (next) {
  if (!this.paymentId) {
    const prefix = "PAY";
    const count = await mongoose.model("Payment").countDocuments();
    this.paymentId = `${prefix}${String(count + 1).padStart(8, '0')}`;
  }
  next();
});

// Virtual for total amount including fees
paymentSchema.virtual('totalAmount').get(function() {
  return this.amount + this.fees.processingFee + this.fees.taxAmount - this.fees.discountAmount;
});

// Virtual for net amount (after fees)
paymentSchema.virtual('netAmount').get(function() {
  return this.amount - this.fees.processingFee;
});

// Method to process refund
paymentSchema.methods.processRefund = function(refundAmount, reason) {
  if (refundAmount > this.amount - this.refundInfo.refundedAmount) {
    throw new Error('Refund amount cannot exceed remaining amount');
  }
  
  this.refundInfo.refundedAmount += refundAmount;
  this.refundInfo.refundReason = reason;
  this.refundInfo.refundedAt = new Date();
  
  if (this.refundInfo.refundedAmount >= this.amount) {
    this.status = 'refunded';
  }
  
  return this.save();
};

// Method to update payment status
paymentSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
        averageAmount: { $avg: "$amount" },
        completedPayments: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
        },
        failedPayments: {
          $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalPayments: 0,
    totalAmount: 0,
    averageAmount: 0,
    completedPayments: 0,
    failedPayments: 0
  };
};

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;