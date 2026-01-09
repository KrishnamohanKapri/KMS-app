const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ingredientBatchSchema = new Schema({
  ingredientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ingredient",
    required: true
  },
  // Quantity in packages (e.g., 5 sacks)
  packageQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  // Quantity in base units (e.g., 10kg total from 5 sacks of 2kg each)
  baseUnitQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  expiryDate: {
    type: Date,
    required: true
  },
  receivedDate: {
    type: Date,
    default: Date.now
  },
  batchNumber: {
    type: String
  },
  // Cost per package for this batch
  costPerPackage: {
    type: Number,
    required: true,
    min: 0
  },
  // Supplier information
  supplier: {
    type: String
  },
  // Purchase order reference
  purchaseOrder: {
    type: String
  }
}, { timestamps: true });

// Virtual field to calculate total cost of this batch
ingredientBatchSchema.virtual('totalCost').get(function() {
  return this.packageQuantity * this.costPerPackage;
});

// Virtual field to get display string
ingredientBatchSchema.virtual('displayQuantity').get(function() {
  return `${this.packageQuantity} packages (${this.baseUnitQuantity} base units)`;
});

// Ensure virtual fields are included when converting to JSON
ingredientBatchSchema.set('toJSON', { virtuals: true });
ingredientBatchSchema.set('toObject', { virtuals: true });

const IngredientBatch = mongoose.model("IngredientBatch", ingredientBatchSchema);
module.exports = IngredientBatch; 