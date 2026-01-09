const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mealSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    servings: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    cookTime: {
      type: Number, // in minutes
      required: false,
    },
    mealType: { type: String, enum: ["breakfast", "lunch", "dinner"]},
    servingStart: {
      type: String, // "HH:mm"
      required: true,
    },
    servingEnd: {
      type: String, // "HH:mm"
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    images: {
      type: [{
        public_id: String,
        url: String,
        width: Number,
        height: Number,
        format: String
      }],
      default: [],
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // References to normalized tables
    nutritionalInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NutritionalInfo"
    },
    dietaryInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DietaryInfo"
    }
  },
  {
    timestamps: true,
  }
);

const Meal = mongoose.model("Meal", mealSchema);
module.exports = Meal;
