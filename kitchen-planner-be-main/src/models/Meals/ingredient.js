const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ingredientSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['vegetable', 'fruit', 'meat', 'dairy', 'grain', 'spice', 'herb', 'other'],
    required: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  // Base unit for calculations (e.g., kg, g, ml, l)
  baseUnit: {
    type: String,
    required: true,
    enum: ['g', 'kg', 'ml', 'l', 'tbsp', 'tsp', 'cup', 'piece', 'slice', 'whole'],
    default: 'g'
  },
  // Packaging unit (e.g., sack, bag, box, bottle, can)
  packagingUnit: {
    type: String,
    required: true,
    enum: ['sack', 'bag', 'box', 'bottle', 'can', 'jar', 'pack', 'bundle', 'carton', 'piece', 'whole'],
    default: 'piece'
  },
  // How much base unit is in each package (e.g., 2kg per sack)
  packagingQuantity: {
    type: Number,
    required: true,
    default: 1,
    min: 0.01
  },
  // Cost per package (e.g., $5 per sack)
  costPerPackage: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  reorderLevel: {
    type: Number,
    required: true,
    default: 10,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Legacy field for backward compatibility
  unit: {
    type: String,
    required: false,
    enum: ['g', 'kg', 'ml', 'l', 'tbsp', 'tsp', 'cup', 'piece', 'slice', 'whole'],
    default: 'g'
  },
  // Legacy field for backward compatibility
  costPerUnit: {
    type: Number,
    required: false,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
});

// Virtual field to calculate cost per base unit
ingredientSchema.virtual('costPerBaseUnit').get(function() {
  return this.costPerPackage / this.packagingQuantity;
});

// Virtual field to get total base units in stock
ingredientSchema.virtual('totalBaseUnits').get(function() {
  return this.stock * this.packagingQuantity;
});

// Virtual field to get display string
ingredientSchema.virtual('displayUnit').get(function() {
  return `${this.packagingUnit} (${this.packagingQuantity} ${this.baseUnit})`;
});

// Ensure virtual fields are included when converting to JSON
ingredientSchema.set('toJSON', { virtuals: true });
ingredientSchema.set('toObject', { virtuals: true });

const Ingredient = mongoose.model("Ingredient", ingredientSchema);
module.exports = Ingredient; 