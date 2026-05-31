const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mealPlanSchema = new Schema({
  // For daily plans, use 'date'. For weekly/multi-day, use 'startDate' and 'endDate'.
  date: { type: Date }, // Optional, for backward compatibility (single day)
  startDate: { type: Date }, // Start of the plan (for week/multi-day)
  endDate: { type: Date },   // End of the plan (for week/multi-day)
  meals: [
    {
      mealId: { type: mongoose.Schema.Types.ObjectId, ref: "Meal", required: true },
      servings: { type: Number, required: true }
    }
  ],
  type: { type: String, enum: ["day", "week"], default: "day" },
  mealTimeType: { type: String, enum: ["breakfast", "lunch", "dinner"]},
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assignedStaff: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  notes: { type: String }
}, { timestamps: true });

const MealPlan = mongoose.model("MealPlan", mealPlanSchema);
module.exports = MealPlan; 