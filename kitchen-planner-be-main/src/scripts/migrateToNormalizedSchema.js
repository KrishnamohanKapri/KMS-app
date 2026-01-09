const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({
  path: path.join(__dirname, "../config/config.env"),
});

// Import old and new models
const OldMeal = require("../models/Meals/meals");
const Category = require("../models/Meals/category");

// Import new normalized models
const NutritionalInfo = require("../models/Meals/nutritionalInfo");
const Allergen = require("../models/Meals/allergen");
const MealAllergen = require("../models/Meals/mealAllergen");
const DietaryInfo = require("../models/Meals/dietaryInfo");
const Ingredient = require("../models/Meals/ingredient");
const MealIngredient = require("../models/Meals/mealIngredient");
const Tag = require("../models/Meals/tag");
const MealTag = require("../models/Meals/mealTag");
const IngredientBatch = require("../models/Meals/ingredientBatch");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

const migrateToNormalizedSchema = async () => {
  try {
    console.log("Starting migration to normalized schema with stock management...");

    // Step 1: Create allergen records from existing meal data
    console.log("Step 1: Creating allergen records...");
    const allergenSet = new Set();
    const oldMeals = await OldMeal.find({});
    
    oldMeals.forEach(meal => {
      if (meal.allergens && Array.isArray(meal.allergens)) {
        meal.allergens.forEach(allergen => allergenSet.add(allergen));
      }
    });

    const allergenMap = new Map();
    for (const allergenName of allergenSet) {
      const allergen = await Allergen.create({
        name: allergenName,
        description: `Contains ${allergenName}`
      });
      allergenMap.set(allergenName, allergen._id);
    }

    // Step 2: Create tag records from existing meal data
    console.log("Step 2: Creating tag records...");
    const tagSet = new Set();
    oldMeals.forEach(meal => {
      if (meal.tags && Array.isArray(meal.tags)) {
        meal.tags.forEach(tag => tagSet.add(tag));
      }
    });

    const tagMap = new Map();
    for (const tagName of tagSet) {
      const tag = await Tag.create({
        name: tagName,
        description: `Tag: ${tagName}`
      });
      tagMap.set(tagName, tag._id);
    }

    // Step 3: Create ingredient records from existing meal data with stock management
    console.log("Step 3: Creating ingredient records with stock management...");
    const ingredientSet = new Set();
    oldMeals.forEach(meal => {
      if (meal.ingredients && Array.isArray(meal.ingredients)) {
        meal.ingredients.forEach(ingredient => ingredientSet.add(ingredient));
      }
    });

    const ingredientMap = new Map();
    for (const ingredientName of ingredientSet) {
      // Create ingredient with stock management fields
      const ingredient = await Ingredient.create({
        name: ingredientName,
        description: `Ingredient: ${ingredientName}`,
        category: 'other', // Default category, can be updated later
        stock: 100, // Default stock for migration
        unit: 'g', // Default unit
        reorderLevel: 20, // Default reorder level
        costPerUnit: 0.01 // Default cost per unit
      });
      ingredientMap.set(ingredientName, ingredient._id);
    }

    // Step 4: Migrate each meal to the new schema
    console.log("Step 4: Migrating meals to new schema...");
    for (const oldMeal of oldMeals) {
      // Create nutritional info
      let nutritionalInfoId = null;
      if (oldMeal.nutritionalInfo) {
        const nutritionalInfo = await NutritionalInfo.create({
          mealId: oldMeal._id,
          ...oldMeal.nutritionalInfo,
          nutriScore: oldMeal.nutriScore
        });
        nutritionalInfoId = nutritionalInfo._id;
      }

      // Create dietary info
      let dietaryInfoId = null;
      if (oldMeal.dietaryInfo) {
        const dietaryInfo = await DietaryInfo.create({
          mealId: oldMeal._id,
          ...oldMeal.dietaryInfo
        });
        dietaryInfoId = dietaryInfo._id;
      }

      // Create meal-allergen relationships
      if (oldMeal.allergens && Array.isArray(oldMeal.allergens)) {
        for (const allergenName of oldMeal.allergens) {
          const allergenId = allergenMap.get(allergenName);
          if (allergenId) {
            await MealAllergen.create({
              mealId: oldMeal._id,
              allergenId: allergenId
            });
          }
        }
      }

      // Create meal-tag relationships
      if (oldMeal.tags && Array.isArray(oldMeal.tags)) {
        for (const tagName of oldMeal.tags) {
          const tagId = tagMap.get(tagName);
          if (tagId) {
            await MealTag.create({
              mealId: oldMeal._id,
              tagId: tagId
            });
          }
        }
      }

      // Create meal-ingredient relationships with stock management
      if (oldMeal.ingredients && Array.isArray(oldMeal.ingredients)) {
        for (const ingredientName of oldMeal.ingredients) {
          const ingredientId = ingredientMap.get(ingredientName);
          if (ingredientId) {
            await MealIngredient.create({
              mealId: oldMeal._id,
              ingredientId: ingredientId,
              quantity: 1, // Default quantity, can be updated later
              unit: 'piece', // Default unit, can be updated later
              isOptional: false,
              cost: 0 // Will be calculated based on ingredient cost
            });
          }
        }
      }

      // Update the meal with references to normalized tables (removing stock and discount)
      const mealUpdateData = {
        nutritionalInfo: nutritionalInfoId,
        dietaryInfo: dietaryInfoId
      };

      // Only include fields that exist in the new schema
      if (oldMeal.title) mealUpdateData.title = oldMeal.title;
      if (oldMeal.description) mealUpdateData.description = oldMeal.description;
      if (oldMeal.servings) mealUpdateData.servings = oldMeal.servings;
      if (oldMeal.price) mealUpdateData.price = oldMeal.price;
      if (oldMeal.category) mealUpdateData.category = oldMeal.category;
      if (oldMeal.images) mealUpdateData.images = oldMeal.images;
      if (oldMeal.isActive !== undefined) mealUpdateData.isActive = oldMeal.isActive;

      await OldMeal.findByIdAndUpdate(oldMeal._id, mealUpdateData);
    }

    // Step 5: Update ingredient costs based on meal prices (optional)
    console.log("Step 5: Calculating ingredient costs...");
    const mealIngredients = await MealIngredient.find().populate('ingredientId mealId');
    
    for (const mealIngredient of mealIngredients) {
      if (mealIngredient.ingredientId && mealIngredient.mealId) {
        // Calculate a simple cost distribution (can be refined later)
        const mealPrice = mealIngredient.mealId.price || 0;
        const estimatedCost = mealPrice * 0.3; // Assume 30% of meal price is ingredient cost
        
        mealIngredient.cost = estimatedCost;
        await mealIngredient.save();
      }
    }

    // Remove 'stock' and 'discount' from all meals
    await OldMeal.updateMany({}, { $unset: { stock: "", discount: "" } });
    console.log("✅ Removed 'stock' and 'discount' fields from all meals.");

    // Ensure all ingredients have stock management fields
    await Ingredient.updateMany(
      {},
      {
        $set: {
          stock: 100,
          unit: "g",
          reorderLevel: 20,
          costPerUnit: 0.01
        }
      }
    );
    console.log("✅ Ensured all ingredients have stock, unit, reorderLevel, and costPerUnit.");

    // Create a default batch for each ingredient if none exists
    const allIngredients = await Ingredient.find();
    const defaultExpiry = new Date();
    defaultExpiry.setDate(defaultExpiry.getDate() + 30); // 30 days from now

    for (const ingredient of allIngredients) {
      const existingBatch = await IngredientBatch.findOne({ ingredientId: ingredient._id });
      if (!existingBatch) {
        await IngredientBatch.create({
          ingredientId: ingredient._id,
          quantity: ingredient.stock || 100,
          expiryDate: defaultExpiry,
          receivedDate: new Date(),
          batchNumber: `BATCH-${ingredient._id.toString().slice(-4)}`
        });
        console.log(`Created default batch for ingredient: ${ingredient.name}`);
      }
    }
    console.log("✅ Created default batches for all ingredients.");

    console.log("Migration completed successfully!");
    console.log(`Migrated ${oldMeals.length} meals`);
    console.log(`Created ${allergenMap.size} allergens`);
    console.log(`Created ${tagMap.size} tags`);
    console.log(`Created ${ingredientMap.size} ingredients with stock management`);
    console.log("\n📋 Migration Summary:");
    console.log("✅ Removed stock and discount from meals");
    console.log("✅ Added stock management to ingredients");
    console.log("✅ Created normalized tables for allergens, ingredients, and tags");
    console.log("✅ Established proper relationships via junction tables");
    console.log("✅ Added cost tracking and reorder levels");
    console.log("\n🔧 Next Steps:");
    console.log("1. Update ingredient stock levels with real data");
    console.log("2. Set proper reorder levels for each ingredient");
    console.log("3. Update ingredient costs based on actual supplier prices");
    console.log("4. Configure proper units for each ingredient");

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    mongoose.connection.close();
  }
};

// Run migration if this script is executed directly
if (require.main === module) {
  migrateToNormalizedSchema();
}

module.exports = migrateToNormalizedSchema; 