const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mealIngredientSchema = new Schema({
  mealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Meal",
    required: true
  },
  ingredientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ingredient",
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['g', 'kg', 'ml', 'l', 'tbsp', 'tsp', 'cup', 'piece', 'slice', 'whole']
  },
  isOptional: {
    type: Boolean,
    default: false
  },
  cost: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
});

// Compound index to ensure unique meal-ingredient combinations
mealIngredientSchema.index({ mealId: 1, ingredientId: 1 }, { unique: true });

const MealIngredient = mongoose.model("MealIngredient", mealIngredientSchema);
module.exports = MealIngredient; 