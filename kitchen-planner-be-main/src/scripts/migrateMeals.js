const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Meal = require('../models/Meals/meals');
const { analyzeNutrition } = require('../utils/nutritionApi');

dotenv.config({ path: './src/config/config.env' });

const migrateMeals = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all meals without nutritional information
    const meals = await Meal.find({
      $or: [
        { nutritionalInfo: { $exists: false } },
        { nutriScore: { $exists: false } },
        { allergens: { $exists: false } },
        { dietaryInfo: { $exists: false } }
      ]
    });

    console.log(`Found ${meals.length} meals to migrate`);

    // Update each meal with default nutritional information
    for (const meal of meals) {
      try {
        // Create default ingredients list if not exists
        if (!meal.ingredients) {
          meal.ingredients = [meal.title];
        }

        // Get nutrition data
        const nutritionData = await analyzeNutrition(meal.ingredients);

        // Update meal with nutrition data
        meal.nutritionalInfo = nutritionData.nutritionalInfo;
        meal.nutriScore = nutritionData.nutriScore;
        meal.allergens = nutritionData.allergens;
        meal.dietaryInfo = {
          vegetarian: nutritionData.healthLabels.includes('vegetarian'),
          vegan: nutritionData.healthLabels.includes('vegan'),
          glutenFree: nutritionData.healthLabels.includes('gluten-free'),
          lactoseFree: nutritionData.healthLabels.includes('lactose-free')
        };

        await meal.save();
        console.log(`Migrated meal: ${meal.title}`);
      } catch (error) {
        console.error(`Error migrating meal ${meal.title}:`, error.message);
      }
    }

    console.log('Migration completed');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateMeals(); 