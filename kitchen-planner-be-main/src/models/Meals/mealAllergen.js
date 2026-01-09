const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mealAllergenSchema = new Schema({
  mealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Meal",
    required: true
  },
  allergenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Allergen",
    required: true
  }
}, {
  timestamps: true,
});

// Compound index to ensure unique meal-allergen combinations
mealAllergenSchema.index({ mealId: 1, allergenId: 1 }, { unique: true });

const MealAllergen = mongoose.model("MealAllergen", mealAllergenSchema);
module.exports = MealAllergen; 