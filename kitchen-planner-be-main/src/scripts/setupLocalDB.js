const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Meal = require('../models/Meals/meals');
const Category = require('../models/Meals/category');
const User = require('../models/User/user');
const NutritionalInfo = require('../models/Meals/nutritionalInfo'); // Import NutritionalInfo model
const DietaryInfo = require('../models/Meals/dietaryInfo');     // Import DietaryInfo model
const bcrypt = require('bcryptjs');
const { analyzeNutrition } = require('../utils/nutritionApi');

dotenv.config({ path: './src/config/config.env' });

const setupLocalDB = async () => {
  try {
    // Connect to local MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to local MongoDB');

    // Clear existing data
    await Promise.all([
      Meal.deleteMany({}),
      Category.deleteMany({}),
      User.deleteMany({}),
      NutritionalInfo.deleteMany({}), // Clear NutritionalInfo
      DietaryInfo.deleteMany({})      // Clear DietaryInfo
    ]);
    console.log('Cleared existing data');

    // Create categories
    const categories = await Category.create([
      { name: 'Breakfast' },
      { name: 'Lunch' },
      { name: 'Dinner' },
      { name: 'Snacks' },
      { name: 'Desserts' }
    ]);
    console.log('Created categories');

    // Create admin user
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'admin123', // Plain text password, will be hashed by pre-save hook
      role: 'admin',
      isVerified: true
    });
    console.log('Created admin user');

    // Create sample meals
    const sampleMeals = [
      {
        title: 'Kebab',
        description: 'A nutritious luch meal',
        servings: 1,
        price: 8.99,
        stock: 20,
        discount: 0,
        category: categories[0]._id,
        tags: ['lunch', 'protein'],
        images: ['/uploads/breakfast-bowl.jpg'],
        ingredients: [
          '500g lamb mince',
          '100g onion',
          '100g fresh breadcrumbs'
        ]
      },
      {
        title: 'Grilled Chicken Salad',
        description: 'Fresh salad with grilled chicken breast',
        servings: 1,
        price: 12.99,
        stock: 15,
        discount: 5,
        category: categories[1]._id,
        tags: ['lunch', 'protein', 'healthy'],
        images: ['/uploads/chicken-salad.jpg'],
        ingredients: [
          '200g of chicken breast',
          '100g mixed salad greens',
          '50g cherry tomatoes',
          '30g cucumber',
          '20ml olive oil',
          '10ml balsamic vinegar'
        ]
      }
    ];

    // Create meals with nutritional information
    for (const mealData of sampleMeals) {
      try {
        const nutritionData = await analyzeNutrition(mealData.ingredients);

        // Create the Meal document first to get its _id
        const meal = new Meal({
          title: mealData.title,
          description: mealData.description,
          servings: mealData.servings,
          price: mealData.price,
          stock: mealData.stock,
          discount: mealData.discount,
          category: mealData.category,
          tags: mealData.tags,
          images: mealData.images,
        });
        await meal.save();

        // Create NutritionalInfo document using meal._id
        const newNutritionalInfo = await NutritionalInfo.create({
          mealId: meal._id,
          nutriScore: nutritionData.nutriScore,
          energy: nutritionData.nutritionalInfo.energy,
          fat: nutritionData.nutritionalInfo.fat,
          saturatedFat: nutritionData.nutritionalInfo.saturatedFat,
          carbohydrates: nutritionData.nutritionalInfo.carbohydrates,
          sugar: nutritionData.nutritionalInfo.sugar,
          protein: nutritionData.nutritionalInfo.protein,
          salt: nutritionData.nutritionalInfo.salt,
          fiber: nutritionData.nutritionalInfo.fiber,
        });

        // Create DietaryInfo document using meal._id
        const newDietaryInfo = await DietaryInfo.create({
          mealId: meal._id,
          vegetarian: nutritionData.healthLabels.includes('vegetarian'),
          vegan: nutritionData.healthLabels.includes('vegan'),
          glutenFree: nutritionData.healthLabels.includes('gluten-free'),
          lactoseFree: nutritionData.healthLabels.includes('lactose-free')
        });


        // Assign ObjectIds to mealData
        mealData.nutritionalInfo = newNutritionalInfo._id;
        mealData.dietaryInfo = newDietaryInfo._id;
        mealData.nutriScore = nutritionData.nutriScore; // Keep nutriScore as direct field
        mealData.allergens = nutritionData.allergens;   // Keep allergens as direct field

        // const meal = new Meal(mealData);
        // await meal.save();
        // console.log(`Created meal: ${meal.title}`);
      } catch (err) {
        console.error(`Failed to create meal: ${mealData.title}`, err.message);
      }
    }

    console.log('Local database setup completed');
    console.log('\nAdmin credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
};

setupLocalDB(); 