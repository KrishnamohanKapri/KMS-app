const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dietaryInfoSchema = new Schema({
  mealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Meal",
    required: true,
    unique: true
  },
  vegetarian: {
    type: Boolean,
    default: false
  },
  vegan: {
    type: Boolean,
    default: false
  },
  glutenFree: {
    type: Boolean,
    default: false
  },
  lactoseFree: {
    type: Boolean,
    default: false
  },
  halal: {
    type: Boolean,
    default: false
  },
  kosher: {
    type: Boolean,
    default: false
  },
  nutFree: {
    type: Boolean,
    default: false
  },
  soyFree: {
    type: Boolean,
    default: false
  },
  eggFree: {
    type: Boolean,
    default: false
  },
  fishFree: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
});

const DietaryInfo = mongoose.model("DietaryInfo", dietaryInfoSchema);
module.exports = DietaryInfo; 