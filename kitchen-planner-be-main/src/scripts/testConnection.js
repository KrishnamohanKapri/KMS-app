const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({
  path: path.join(__dirname, "../config/config.env"),
});

// Import models
const Meal = require("../models/Meals/meals");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    testConnection(); // Call testConnection only after successful connection
  })
  .catch(err => console.error("MongoDB connection error:", err));

const testConnection = async () => {
  try {
    console.log("Testing database connection...");
    console.log("MONGO_URI:", process.env.MONGO_URI);
    
    // Check if we can connect
    const connection = mongoose.connection;
    console.log("Mongoose Connection Object:", connection);
    console.log(`Connected to: ${connection.host}:${connection.port}/${connection.name}`);
    
    // Check existing meals
    const mealCount = await Meal.countDocuments();
    console.log(`Found ${mealCount} existing meals`);
    
    if (mealCount > 0) {
      const sampleMeal = await Meal.findOne();
      console.log("Sample meal structure:", JSON.stringify(sampleMeal, null, 2));
    }
    
    console.log("Connection test completed successfully!");
    
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    mongoose.connection.close();
  }
};

// The call to testConnection is now handled within the .then() block of mongoose.connect

module.exports = testConnection; 