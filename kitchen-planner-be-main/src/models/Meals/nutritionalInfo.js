const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const nutritionalInfoSchema = new Schema({
  mealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Meal",
    required: true,
    unique: true
  },
  energy: {
    value: Number,  // in kcal
    unit: {
      type: String,
      default: 'kcal'
    }
  },
  fat: {
    value: Number,  // in grams
    unit: {
      type: String,
      default: 'g'
    }
  },
  saturatedFat: {
    value: Number,  // in grams
    unit: {
      type: String,
      default: 'g'
    }
  },
  carbohydrates: {
    value: Number,  // in grams
    unit: {
      type: String,
      default: 'g'
    }
  },
  sugar: {
    value: Number,  // in grams
    unit: {
      type: String,
      default: 'g'
    }
  },
  protein: {
    value: Number,  // in grams
    unit: {
      type: String,
      default: 'g'
    }
  },
  salt: {
    value: Number,  // in grams
    unit: {
      type: String,
      default: 'g'
    }
  },
  fiber: {
    value: Number,  // in grams
    unit: {
      type: String,
      default: 'g'
    }
  },
  nutriScore: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'E'],
    required: true
  }
}, {
  timestamps: true,
});

const NutritionalInfo = mongoose.model("NutritionalInfo", nutritionalInfoSchema);
module.exports = NutritionalInfo; 