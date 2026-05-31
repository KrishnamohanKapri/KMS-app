const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const customerSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  customerId: {
    type: String,
    unique: true,
  },
  billingInfo: {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: props => `${props.value} is not a valid email!`
      }
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
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
    },
    company: {
      type: String,
    },
    taxId: {
      type: String,
    },
  },
  preferences: {
    dietaryRestrictions: [{
      type: String,
      enum: ["vegetarian", "vegan", "gluten-free", "dairy-free", "nut-free", "halal", "kosher", "none"],
    }],
    allergies: [{
      type: String,
    }],
    preferredPaymentMethod: {
      type: String,
      enum: ["card", "paypal", "stripe", "cash"],
      default: "card",
    },
    newsletterSubscription: {
      type: Boolean,
      default: true,
    },
    marketingEmails: {
      type: Boolean,
      default: true,
    },
  },
  loyaltyPoints: {
    type: Number,
    default: 0,
  },
  totalOrders: {
    type: Number,
    default: 0,
  },
  totalSpent: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["active", "inactive", "suspended"],
    default: "active",
  },
  notes: {
    type: String,
  },
}, { timestamps: true });

// Generate unique customer ID before saving
customerSchema.pre("save", async function (next) {
  if (!this.customerId) {
    const prefix = "CUST";
    const count = await mongoose.model("Customer").countDocuments();
    this.customerId = `${prefix}${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Virtual for full name
customerSchema.virtual('fullName').get(function() {
  return `${this.billingInfo.firstName} ${this.billingInfo.lastName}`;
});

// Virtual for full address
customerSchema.virtual('fullAddress').get(function() {
  const addr = this.billingInfo.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

// Method to update loyalty points
customerSchema.methods.addLoyaltyPoints = function(points) {
  this.loyaltyPoints += points;
  return this.save();
};

// Method to update order statistics
customerSchema.methods.updateOrderStats = function(orderTotal) {
  this.totalOrders += 1;
  this.totalSpent += orderTotal;
  return this.save();
};

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer; 