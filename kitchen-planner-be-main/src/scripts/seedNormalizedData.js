const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({
  path: path.join(__dirname, "../config/config.env"),
});

// Import normalized models
const Allergen = require("../models/Meals/allergen");
const Ingredient = require("../models/Meals/ingredient");
const Tag = require("../models/Meals/tag");
const IngredientBatch = require("../models/Meals/ingredientBatch");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

const seedNormalizedData = async () => {
  try {
    console.log("Starting to seed normalized data with stock management...");

    // Seed Allergens
    console.log("Seeding allergens...");
    const allergens = [
      { name: "Gluten", description: "Contains gluten from wheat, rye, barley" },
      { name: "Lactose", description: "Contains lactose from dairy products" },
      { name: "Nuts", description: "Contains tree nuts or peanuts" },
      { name: "Eggs", description: "Contains eggs or egg products" },
      { name: "Soy", description: "Contains soy or soy products" },
      { name: "Fish", description: "Contains fish or fish products" },
      { name: "Shellfish", description: "Contains shellfish or crustaceans" },
      { name: "Sesame", description: "Contains sesame seeds or oil" },
      { name: "Mustard", description: "Contains mustard or mustard seeds" },
      { name: "Celery", description: "Contains celery or celery products" }
    ];

    for (const allergen of allergens) {
      const existingAllergen = await Allergen.findOne({ name: allergen.name });
      if (!existingAllergen) {
        await Allergen.create(allergen);
        console.log(`Created allergen: ${allergen.name}`);
      } else {
        console.log(`Allergen already exists: ${allergen.name}`);
      }
    }

    // Seed Ingredients with Stock Management
    console.log("Seeding ingredients with stock management...");
    const ingredients = [
      // Vegetables
      { name: "Tomato", description: "Fresh tomato", category: "vegetable", stock: 50, unit: "piece", reorderLevel: 10, costPerUnit: 0.50 },
      { name: "Onion", description: "Fresh onion", category: "vegetable", stock: 30, unit: "piece", reorderLevel: 5, costPerUnit: 0.30 },
      { name: "Garlic", description: "Fresh garlic cloves", category: "vegetable", stock: 100, unit: "piece", reorderLevel: 20, costPerUnit: 0.10 },
      { name: "Bell Pepper", description: "Fresh bell pepper", category: "vegetable", stock: 25, unit: "piece", reorderLevel: 5, costPerUnit: 0.75 },
      { name: "Carrot", description: "Fresh carrot", category: "vegetable", stock: 40, unit: "piece", reorderLevel: 8, costPerUnit: 0.25 },
      { name: "Broccoli", description: "Fresh broccoli", category: "vegetable", stock: 20, unit: "piece", reorderLevel: 4, costPerUnit: 1.00 },
      { name: "Spinach", description: "Fresh spinach leaves", category: "vegetable", stock: 15, unit: "kg", reorderLevel: 3, costPerUnit: 2.50 },
      { name: "Mushroom", description: "Fresh mushrooms", category: "vegetable", stock: 30, unit: "kg", reorderLevel: 5, costPerUnit: 3.00 },
      
      // Fruits
      { name: "Apple", description: "Fresh apple", category: "fruit", stock: 60, unit: "piece", reorderLevel: 12, costPerUnit: 0.60 },
      { name: "Banana", description: "Fresh banana", category: "fruit", stock: 80, unit: "piece", reorderLevel: 15, costPerUnit: 0.25 },
      { name: "Orange", description: "Fresh orange", category: "fruit", stock: 45, unit: "piece", reorderLevel: 9, costPerUnit: 0.40 },
      { name: "Lemon", description: "Fresh lemon", category: "fruit", stock: 70, unit: "piece", reorderLevel: 14, costPerUnit: 0.30 },
      { name: "Lime", description: "Fresh lime", category: "fruit", stock: 65, unit: "piece", reorderLevel: 13, costPerUnit: 0.35 },
      
      // Meat
      { name: "Chicken Breast", description: "Fresh chicken breast", category: "meat", stock: 25, unit: "kg", reorderLevel: 5, costPerUnit: 8.00 },
      { name: "Ground Beef", description: "Fresh ground beef", category: "meat", stock: 20, unit: "kg", reorderLevel: 4, costPerUnit: 12.00 },
      { name: "Salmon", description: "Fresh salmon fillet", category: "meat", stock: 15, unit: "kg", reorderLevel: 3, costPerUnit: 15.00 },
      { name: "Bacon", description: "Fresh bacon", category: "meat", stock: 10, unit: "kg", reorderLevel: 2, costPerUnit: 10.00 },
      { name: "Turkey", description: "Fresh turkey", category: "meat", stock: 8, unit: "kg", reorderLevel: 2, costPerUnit: 9.00 },
      
      // Dairy
      { name: "Milk", description: "Fresh milk", category: "dairy", stock: 50, unit: "l", reorderLevel: 10, costPerUnit: 1.20 },
      { name: "Cheese", description: "Fresh cheese", category: "dairy", stock: 30, unit: "kg", reorderLevel: 6, costPerUnit: 6.00 },
      { name: "Butter", description: "Fresh butter", category: "dairy", stock: 20, unit: "kg", reorderLevel: 4, costPerUnit: 4.50 },
      { name: "Yogurt", description: "Fresh yogurt", category: "dairy", stock: 40, unit: "l", reorderLevel: 8, costPerUnit: 1.50 },
      { name: "Cream", description: "Fresh cream", category: "dairy", stock: 25, unit: "l", reorderLevel: 5, costPerUnit: 2.00 },
      
      // Grains
      { name: "Rice", description: "White rice", category: "grain", stock: 100, unit: "kg", reorderLevel: 20, costPerUnit: 1.50 },
      { name: "Pasta", description: "Fresh pasta", category: "grain", stock: 40, unit: "kg", reorderLevel: 8, costPerUnit: 2.00 },
      { name: "Bread", description: "Fresh bread", category: "grain", stock: 60, unit: "piece", reorderLevel: 12, costPerUnit: 1.00 },
      { name: "Quinoa", description: "Fresh quinoa", category: "grain", stock: 30, unit: "kg", reorderLevel: 6, costPerUnit: 4.00 },
      { name: "Oats", description: "Fresh oats", category: "grain", stock: 50, unit: "kg", reorderLevel: 10, costPerUnit: 1.80 },
      
      // Spices
      { name: "Salt", description: "Table salt", category: "spice", stock: 20, unit: "kg", reorderLevel: 4, costPerUnit: 0.50 },
      { name: "Black Pepper", description: "Fresh black pepper", category: "spice", stock: 15, unit: "kg", reorderLevel: 3, costPerUnit: 8.00 },
      { name: "Oregano", description: "Fresh oregano", category: "spice", stock: 10, unit: "kg", reorderLevel: 2, costPerUnit: 12.00 },
      { name: "Basil", description: "Fresh basil", category: "spice", stock: 8, unit: "kg", reorderLevel: 2, costPerUnit: 15.00 },
      { name: "Thyme", description: "Fresh thyme", category: "spice", stock: 12, unit: "kg", reorderLevel: 3, costPerUnit: 10.00 },
      { name: "Rosemary", description: "Fresh rosemary", category: "spice", stock: 10, unit: "kg", reorderLevel: 2, costPerUnit: 11.00 },
      { name: "Cumin", description: "Ground cumin", category: "spice", stock: 8, unit: "kg", reorderLevel: 2, costPerUnit: 9.00 },
      { name: "Paprika", description: "Ground paprika", category: "spice", stock: 12, unit: "kg", reorderLevel: 3, costPerUnit: 7.00 },
      
      // Herbs
      { name: "Parsley", description: "Fresh parsley", category: "herb", stock: 15, unit: "kg", reorderLevel: 3, costPerUnit: 6.00 },
      { name: "Cilantro", description: "Fresh cilantro", category: "herb", stock: 12, unit: "kg", reorderLevel: 3, costPerUnit: 5.50 },
      { name: "Mint", description: "Fresh mint", category: "herb", stock: 10, unit: "kg", reorderLevel: 2, costPerUnit: 7.00 },
      { name: "Dill", description: "Fresh dill", category: "herb", stock: 8, unit: "kg", reorderLevel: 2, costPerUnit: 8.00 },
      
      // Other
      { name: "Olive Oil", description: "Extra virgin olive oil", category: "other", stock: 40, unit: "l", reorderLevel: 8, costPerUnit: 3.50 },
      { name: "Egg", description: "Fresh egg", category: "other", stock: 200, unit: "piece", reorderLevel: 40, costPerUnit: 0.20 },
      { name: "Sugar", description: "Granulated sugar", category: "other", stock: 50, unit: "kg", reorderLevel: 10, costPerUnit: 1.00 },
      { name: "Flour", description: "All-purpose flour", category: "other", stock: 80, unit: "kg", reorderLevel: 16, costPerUnit: 0.80 },
      { name: "Honey", description: "Pure honey", category: "other", stock: 25, unit: "l", reorderLevel: 5, costPerUnit: 4.00 }
    ];

    for (const ingredient of ingredients) {
      const existingIngredient = await Ingredient.findOne({ name: ingredient.name });
      if (!existingIngredient) {
        await Ingredient.create(ingredient);
        console.log(`Created ingredient: ${ingredient.name} (Stock: ${ingredient.stock} ${ingredient.unit})`);
      } else {
        console.log(`Ingredient already exists: ${ingredient.name}`);
      }
    }

    const allIngredients = await Ingredient.find();
    const today = new Date();

    for (const ingredient of allIngredients) {
      // Create 2 batches per ingredient: one expiring soon, one later
      await IngredientBatch.create({
        ingredientId: ingredient._id,
        packageQuantity: 1, // 1 package
        baseUnitQuantity: Math.floor(ingredient.stock / 2), // Half of stock
        expiryDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        receivedDate: today,
        batchNumber: `BATCH1-${ingredient._id.toString().slice(-4)}`,
        costPerPackage: ingredient.costPerUnit * Math.floor(ingredient.stock / 2) // Cost for this batch
      });
      await IngredientBatch.create({
        ingredientId: ingredient._id,
        packageQuantity: 1, // 1 package
        baseUnitQuantity: Math.ceil(ingredient.stock / 2), // Remaining stock
        expiryDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        receivedDate: today,
        batchNumber: `BATCH2-${ingredient._id.toString().slice(-4)}`,
        costPerPackage: ingredient.costPerUnit * Math.ceil(ingredient.stock / 2) // Cost for this batch
      });
      console.log(`Seeded batches for ingredient: ${ingredient.name}`);
    }
    console.log("✅ Seeded batches for all ingredients.");

    // Seed Tags
    console.log("Seeding tags...");
    const tags = [
      { name: "Spicy", description: "Contains spicy ingredients", color: "#FF4444" },
      { name: "Vegetarian", description: "Suitable for vegetarians", color: "#44FF44" },
      { name: "Vegan", description: "Suitable for vegans", color: "#44FF44" },
      { name: "Gluten-Free", description: "No gluten ingredients", color: "#4444FF" },
      { name: "Dairy-Free", description: "No dairy ingredients", color: "#FF8844" },
      { name: "Low-Carb", description: "Low carbohydrate content", color: "#8844FF" },
      { name: "High-Protein", description: "High protein content", color: "#FF4488" },
      { name: "Organic", description: "Made with organic ingredients", color: "#44FF88" },
      { name: "Quick", description: "Quick to prepare", color: "#FFAA44" },
      { name: "Healthy", description: "Healthy meal option", color: "#44FFAA" },
      { name: "Popular", description: "Popular choice", color: "#FF44AA" },
      { name: "Chef's Choice", description: "Chef's special recommendation", color: "#AA44FF" },
      { name: "Seasonal", description: "Seasonal ingredients", color: "#44AAFF" },
      { name: "Local", description: "Made with local ingredients", color: "#AAFF44" },
      { name: "Traditional", description: "Traditional recipe", color: "#FFAA88" }
    ];

    for (const tag of tags) {
      const existingTag = await Tag.findOne({ name: tag.name });
      if (!existingTag) {
        await Tag.create(tag);
        console.log(`Created tag: ${tag.name}`);
      } else {
        console.log(`Tag already exists: ${tag.name}`);
      }
    }

    console.log("\n✅ Normalized data seeding completed successfully!");
    console.log("\n📊 Stock Management Summary:");
    console.log("• All ingredients now have stock levels, reorder levels, and costs");
    console.log("• Stock availability will be calculated dynamically for meals");
    console.log("• Low stock alerts will be triggered when stock ≤ reorder level");
    console.log("\n🔧 Next Steps:");
    console.log("1. Adjust stock levels based on actual inventory");
    console.log("2. Update reorder levels based on usage patterns");
    console.log("3. Set accurate cost per unit from suppliers");
    console.log("4. Configure proper units for each ingredient");

  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    mongoose.connection.close();
  }
};

// Run seeding if this script is executed directly
if (require.main === module) {
  seedNormalizedData();
}

module.exports = seedNormalizedData; 