const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const allergenSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
});

const Allergen = mongoose.model("Allergen", allergenSchema);
module.exports = Allergen; 