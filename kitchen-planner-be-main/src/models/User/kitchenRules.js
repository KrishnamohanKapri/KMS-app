const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const kitchenRulesSchema = new Schema({
  kitchenId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  rules: {
    type: [String],
    default: [],
    validate: {
      validator: function(rules) {
        return rules.every(rule => typeof rule === 'string' && rule.trim().length > 0);
      },
      message: 'All rules must be non-empty strings'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Update the updatedAt field before saving
kitchenRulesSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
kitchenRulesSchema.index({ kitchenId: 1 });
kitchenRulesSchema.index({ isActive: 1 });

const KitchenRules = mongoose.model("KitchenRules", kitchenRulesSchema);

module.exports = KitchenRules;
