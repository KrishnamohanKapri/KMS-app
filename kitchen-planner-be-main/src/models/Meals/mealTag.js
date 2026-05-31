const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mealTagSchema = new Schema({
  mealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Meal",
    required: true
  },
  tagId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tag",
    required: true
  }
}, {
  timestamps: true,
});

// Compound index to ensure unique meal-tag combinations
mealTagSchema.index({ mealId: 1, tagId: 1 }, { unique: true });

const MealTag = mongoose.model("MealTag", mealTagSchema);
module.exports = MealTag; 