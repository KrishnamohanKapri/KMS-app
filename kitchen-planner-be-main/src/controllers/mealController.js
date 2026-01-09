const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const Meal = require("../models/Meals/meals");
const Category = require("../models/Meals/category");
const NutritionalInfo = require("../models/Meals/nutritionalInfo");
const Allergen = require("../models/Meals/allergen");
const MealAllergen = require("../models/Meals/mealAllergen");
const DietaryInfo = require("../models/Meals/dietaryInfo");
const Ingredient = require("../models/Meals/ingredient");
const MealIngredient = require("../models/Meals/mealIngredient");
const Tag = require("../models/Meals/tag");
const MealTag = require("../models/Meals/mealTag");
const { calculateMealAvailability } = require("../utils/mealAvailability");
const path = require("path");
const { analyzeNutrition } = require("../utils/nutritionApi");
const { uploadImage, deleteImage, updateImage } = require("../utils/cloudinary");

const getAllMeals = async (req, res) => {
  // #swagger.tags = ['meals']
try {
    const searchFilter = req.query.search
      ? { title: { $regex: req.query.search, $options: "i" } }
      : {};

    const categoryFilter =
      req.query.category && req.query.category !== "all"
        ? { category: req.query.category }
        : {};

    const mealTypeFilter =
      req.query.mealType && req.query.mealType !== "all"
        ? { mealType: req.query.mealType }
        : {};

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const meals = await Meal.find({
      ...searchFilter,
      ...categoryFilter,
      ...mealTypeFilter,
      isActive: true,
    })
      .populate("category")
      .populate("nutritionalInfo")
      .populate("dietaryInfo")
      .skip(skip)
      .limit(limit);

    const mealsWithRelations = await Promise.all(
      meals.map(async (meal) => {
        const [allergens, ingredients, tags, availability] = await Promise.all([
          MealAllergen.find({ mealId: meal._id }).populate("allergenId"),
          MealIngredient.find({ mealId: meal._id }).populate("ingredientId"),
          MealTag.find({ mealId: meal._id }).populate("tagId"),
          calculateMealAvailability(meal._id),
        ]);

        return {
          ...meal.toObject(),
          allergens: allergens.map((ma) => ma.allergenId),
          ingredients: ingredients.map((mi) => ({
            ingredient: mi.ingredientId,
            quantity: mi.quantity,
            unit: mi.unit,
            isOptional: mi.isOptional,
            cost: mi.cost,
          })),
          tags: tags.map((mt) => mt.tagId),
          availability: {
            available: availability.available,
            availableServings: availability.availableServings,
            totalCost: availability.totalCost,
            missingIngredients: availability.missingIngredients,
            lowStockIngredients: availability.lowStockIngredients,
          },
        };
      })
    );

    return SuccessHandler(mealsWithRelations, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getMeal = async (req, res) => {
  // #swagger.tags = ['meals']
  try {
    const meal = await Meal.findById(req.params.id)
      .populate("category")
      .populate("nutritionalInfo")
      .populate("dietaryInfo");

    if (!meal) {
      return ErrorHandler("Meal not found", 404, req, res);
    }

    // Populate related data and calculate availability
    const [allergens, ingredients, tags, availability] = await Promise.all([
      MealAllergen.find({ mealId: meal._id }).populate("allergenId"),
      MealIngredient.find({ mealId: meal._id }).populate("ingredientId"),
      MealTag.find({ mealId: meal._id }).populate("tagId"),
      calculateMealAvailability(meal._id)
    ]);

    const mealWithRelations = {
      ...meal.toObject(),
      allergens: allergens.map(ma => ma.allergenId),
      ingredients: ingredients.map(mi => ({
        ingredient: mi.ingredientId,
        quantity: mi.quantity,
        unit: mi.unit,
        isOptional: mi.isOptional,
        cost: mi.cost
      })),
      tags: tags.map(mt => mt.tagId),
      availability: {
        available: availability.available,
        availableServings: availability.availableServings,
        totalCost: availability.totalCost,
        missingIngredients: availability.missingIngredients,
        lowStockIngredients: availability.lowStockIngredients
      }
    };

    return SuccessHandler(mealWithRelations, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const createMeal = async (req, res) => {
  // #swagger.tags = ['meals']
  try {
    const {
      title,
      description,
      servings,
      price,
      category,
      tags,
      ingredients,
      allergens,
      cookTime,
      servingEnd,
      servingStart,
      mealType
    } = req.body;

    let imageData = null;

    // Handle image upload if present (using Cloudinary)
    if (req.file) {
      try {
        const uploadResult = await uploadImage(req.file, {
          folder: 'kitchen-planner/meals',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          max_size: 5 * 1024 * 1024 // 5MB for meal images
        });

        imageData = {
          public_id: uploadResult.public_id,
          url: uploadResult.url,
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format
        };
      } catch (uploadError) {
        return ErrorHandler(`Image upload failed: ${uploadError.message}`, 400, req, res);
      }
    }

    // Create the meal first
    const meal = await Meal.create({
      title,
      description,
      servings,
      price,
      category,
      images: imageData ? [imageData] : [],
      cookTime,
      servingStart,
      servingEnd,
      mealType
    });

    // Create or find ingredients and create meal-ingredient relationships
    const { ingredientQuantities, ingredientUnits } = req.body;

    // Parse ingredients and get nutrition data
    const parsedIngredients = JSON.parse(ingredients);
    const parsedQuantities = JSON.parse(ingredientQuantities);
    const parsedUnits = JSON.parse(ingredientUnits);
    const combinedIngredients = parsedIngredients.map((ingredient, index) => {
      return `${parsedQuantities[index]} ${parsedUnits[index]} ${ingredient}`;
    });
    const nutritionData = await analyzeNutrition(combinedIngredients);

    // Create nutritional info
    const nutritionalInfo = await NutritionalInfo.create({
      mealId: meal._id,
      ...nutritionData.nutritionalInfo,
      nutriScore: nutritionData.nutriScore
    });
    // Create dietary info
    const dietaryInfo = await DietaryInfo.create({
      mealId: meal._id,
      vegetarian: nutritionData.healthLabels.includes("vegetarian"),
      vegan: nutritionData.healthLabels.includes("vegan"),
      glutenFree: nutritionData.healthLabels.includes("gluten-free"),
      lactoseFree: nutritionData.healthLabels.includes("lactose-free"),
    });

    // Update meal with references
    meal.nutritionalInfo = nutritionalInfo._id;
    meal.dietaryInfo = dietaryInfo._id;
    await meal.save();

    // Handle ingredients - can be either array of strings or single string
    let ingredientsArray = [];
    let quantitiesArray = [];
    let unitsArray = [];

    if (ingredients) {
      if (Array.isArray(ingredients)) {
        ingredientsArray = ingredients;
      } else if (typeof ingredients === 'string') {
        // Try to parse as JSON for backward compatibility
        try {
          const parsed = JSON.parse(ingredients);
          ingredientsArray = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          // If not JSON, treat as single ingredient
          ingredientsArray = [ingredients];
        }
      }
    }

    // Handle quantities - can be array of numbers or single number
    if (ingredientQuantities) {
      if (Array.isArray(ingredientQuantities)) {
        quantitiesArray = ingredientQuantities;
      } else if (typeof ingredientQuantities === 'number') {
        quantitiesArray = [ingredientQuantities];
      } else if (typeof ingredientQuantities === 'string') {
        // Try to parse as JSON for backward compatibility
        try {
          const parsed = JSON.parse(ingredientQuantities);
          quantitiesArray = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          // If not JSON, treat as single quantity
          quantitiesArray = [parseFloat(ingredientQuantities) || 50];
        }
      }
    }

    // Handle units - can be array of strings or single string
    if (ingredientUnits) {
      if (Array.isArray(ingredientUnits)) {
        unitsArray = ingredientUnits;
      } else if (typeof ingredientUnits === 'string') {
        // Try to parse as JSON for backward compatibility
        try {
          const parsed = JSON.parse(ingredientUnits);
          if (Array.isArray(parsed)) {
            unitsArray = parsed;
          } else {
            unitsArray = [ingredientUnits];
          }
        } catch (e) {
          // If not JSON, treat as single unit
          unitsArray = [ingredientUnits];
        }
      }
    }

    // Ensure all arrays have the same length by padding with defaults
    const maxLength = Math.max(ingredientsArray.length, quantitiesArray.length, unitsArray.length);

    // Pad ingredients array
    while (ingredientsArray.length < maxLength) {
      ingredientsArray.push('unknown');
    }

    // Pad quantities array with default 50
    while (quantitiesArray.length < maxLength) {
      quantitiesArray.push(50);
    }

    // Pad units array with default 'g'
    while (unitsArray.length < maxLength) {
      unitsArray.push('g');
    }

    console.log('Processing ingredients:', {
      ingredients: ingredientsArray,
      quantities: quantitiesArray,
      units: unitsArray
    });

    // Debug: Log the exact types and values
    console.log('Debug - Array types and values:');
    ingredientsArray.forEach((item, index) => {
      console.log(`  ingredientsArray[${index}]: ${JSON.stringify(item)} (type: ${typeof item}, isArray: ${Array.isArray(item)})`);
    });
    quantitiesArray.forEach((item, index) => {
      console.log(`  quantitiesArray[${index}]: ${JSON.stringify(item)} (type: ${typeof item}, isArray: ${Array.isArray(item)})`);
    });
    unitsArray.forEach((item, index) => {
      console.log(`  unitsArray[${index}]: ${JSON.stringify(item)} (type: ${typeof item}, isArray: ${Array.isArray(item)})`);
    });

    for (let i = 0; i < maxLength; i++) {
      const ingredientName = ingredientsArray[i];
      const quantity = quantitiesArray[i];
      const unit = unitsArray[i];

      if (!ingredientName || ingredientName === 'unknown') {
        console.log(`Skipping ingredient at index ${i} - no name provided`);
        continue;
      }

      // Ensure we have individual values, not arrays
      const finalIngredientName = Array.isArray(ingredientName) ? ingredientName[0] : ingredientName;
      const finalQuantity = Array.isArray(quantity) ? quantity[0] : quantity;
      const finalUnit = Array.isArray(unit) ? unit[0] : unit;

      // Additional safety check - ensure we have primitive values
      if (Array.isArray(finalIngredientName) || Array.isArray(finalQuantity) || Array.isArray(finalUnit)) {
        console.log(`❌ Error: Still have arrays after extraction:`, {
          ingredientName: finalIngredientName,
          quantity: finalQuantity,
          unit: finalUnit
        });
        continue;
      }

      console.log(`Processing ingredient: ${finalIngredientName}, quantity: ${finalQuantity}, unit: ${finalUnit}`);
      console.log(`Types: ingredientName=${typeof finalIngredientName}, quantity=${typeof finalQuantity}, unit=${typeof finalUnit}`);

      let ingredient = await Ingredient.findOne({ name: finalIngredientName });
      if (!ingredient) {
        ingredient = await Ingredient.create({
          name: finalIngredientName,
          description: `Ingredient: ${finalIngredientName}`,
          category: 'other',
          stock: 1000, // Default stock - set to 1000 units for testing
          baseUnit: 'g', // Set base unit to grams
          packagingUnit: 'piece', // Set packaging unit to piece
          packagingQuantity: 1, // Set packaging quantity to 1g
          costPerPackage: 0, // Default cost per package
          reorderLevel: 10 // Default reorder level
        });
      }

      // Calculate total quantity needed for all servings
      const totalQuantity = finalQuantity * servings;

      // Final safety check before creating MealIngredient
      console.log(`Final values before MealIngredient.create:`);
      console.log(`  mealId: ${meal._id} (type: ${typeof meal._id})`);
      console.log(`  ingredientId: ${ingredient._id} (type: ${typeof ingredient._id})`);
      console.log(`  quantity: ${totalQuantity} (type: ${typeof totalQuantity})`);
      console.log(`  unit: ${finalUnit} (type: ${typeof finalUnit}, isArray: ${Array.isArray(finalUnit)})`);

      if (Array.isArray(finalUnit)) {
        console.log(`❌ CRITICAL ERROR: finalUnit is still an array: ${JSON.stringify(finalUnit)}`);
        console.log(`   Skipping this ingredient to prevent validation error`);
        continue;
      }

      await MealIngredient.create({
        mealId: meal._id,
        ingredientId: ingredient._id,
        quantity: totalQuantity, // Total quantity needed for ALL servings
        unit: finalUnit
      });

      console.log(`Created meal-ingredient: ${finalIngredientName} - ${totalQuantity}${finalUnit} for ${servings} servings (${finalQuantity}${finalUnit} per serving)`);
    }

    // Create or find tags and create meal-tag relationships
    const parsedTags = JSON.parse(tags);
    for (const tagName of parsedTags) {
      let tag = await Tag.findOne({ name: tagName });
      if (!tag) {
        tag = await Tag.create({
          name: tagName,
          description: `Tag: ${tagName}`
        });
      }
      await MealTag.create({
        mealId: meal._id,
        tagId: tag._id
      });
    }

    // Create meal-allergen relationships if allergens are provided
    if (allergens) {
      const parsedAllergens = JSON.parse(allergens);
      for (const allergenName of parsedAllergens) {
        let allergen = await Allergen.findOne({ name: allergenName });
        if (!allergen) {
          allergen = await Allergen.create({
            name: allergenName,
            description: `Contains ${allergenName}`
          });
        }
        await MealAllergen.create({
          mealId: meal._id,
          allergenId: allergen._id
        });
      }
    }

    // Populate related data to return complete meal information
    const [populatedAllergens, populatedIngredients, populatedTags, availability] = await Promise.all([
      MealAllergen.find({ mealId: meal._id }).populate("allergenId"),
      MealIngredient.find({ mealId: meal._id }).populate("ingredientId"),
      MealTag.find({ mealId: meal._id }).populate("tagId"),
      calculateMealAvailability(meal._id)
    ]);

    const mealWithRelations = {
      ...meal.toObject(),
      allergens: populatedAllergens.map(ma => ma.allergenId),
      ingredients: populatedIngredients.map(mi => ({
        ingredient: mi.ingredientId,
        quantity: mi.quantity,
        unit: mi.unit,
        isOptional: mi.isOptional,
        cost: mi.cost
      })),
      tags: populatedTags.map(mt => mt.tagId),
      availability: {
        available: availability.available,
        availableServings: availability.availableServings,
        totalCost: availability.totalCost,
        missingIngredients: availability.missingIngredients,
        lowStockIngredients: availability.lowStockIngredients
      }
    };

    return SuccessHandler(mealWithRelations, 201, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const updateMeal = async (req, res) => {
  // #swagger.tags = ['meals']
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      return ErrorHandler("Meal not found", 404, req, res);
    }
    const {
      title,
      description,
      servings,
      price,
      stock,
      discount,
      category,
      tags,
      ingredients,
      allergens,
      cookTime,
      servingEnd,
      servingStart,
      mealType
    } = req.body;

    // Handle image update if new image is uploaded
    if (req.file) {
      try {
        // Delete old images from Cloudinary if they exist
        if (meal.images && meal.images.length > 0) {
          for (const image of meal.images) {
            if (image.public_id) {
              await deleteImage(image.public_id);
            }
          }
        }

        // Upload new image to Cloudinary
        const uploadResult = await uploadImage(req.file, {
          folder: 'kitchen-planner/meals',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          max_size: 5 * 1024 * 1024
        });

        // Update meal with new Cloudinary image data
        meal.images = [{
          public_id: uploadResult.public_id,
          url: uploadResult.url,
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format
        }];
      } catch (uploadError) {
        return ErrorHandler(`Image upload failed: ${uploadError.message}`, 400, req, res);
      }
    }

    // Update other meal fields
    if (title) meal.title = title;
    if (description) meal.description = description;
    if (servings) meal.servings = servings;
    if (price) meal.price = price;
    if (stock !== undefined) meal.stock = stock;
    if (discount !== undefined) meal.discount = discount;
    if (category) meal.category = category;
    if (cookTime) meal.cookTime = cookTime;
    if (servingEnd) meal.servingEnd = servingEnd;
    if (servingStart) meal.servingStart = servingStart;
    if (mealType) meal.mealType = mealType;

    await meal.save();

    // Update ingredients if provided
    if (ingredients) {
      // Remove existing meal-ingredient relationships
      await MealIngredient.deleteMany({ mealId: meal._id });

      // Get quantities and units from request body
      const { ingredientQuantities, ingredientUnits } = req.body;

      // Handle ingredients - can be either array of strings or single string
      let ingredientsArray = [];
      let quantitiesArray = [];
      let unitsArray = [];

      if (ingredients) {
        if (Array.isArray(ingredients)) {
          ingredientsArray = ingredients;
        } else if (typeof ingredients === 'string') {
          // Try to parse as JSON for backward compatibility
          try {
            const parsed = JSON.parse(ingredients);
            ingredientsArray = Array.isArray(parsed) ? parsed : [parsed];
          } catch (e) {
            // If not JSON, treat as single ingredient
            ingredientsArray = [ingredients];
          }
        }
      }

      // Handle quantities - can be array of numbers or single number
      if (ingredientQuantities) {
        if (Array.isArray(ingredientQuantities)) {
          quantitiesArray = ingredientQuantities;
        } else if (typeof ingredientQuantities === 'number') {
          quantitiesArray = [ingredientQuantities];
        } else if (typeof ingredientQuantities === 'string') {
          // Try to parse as JSON for backward compatibility
          try {
            const parsed = JSON.parse(ingredientQuantities);
            quantitiesArray = Array.isArray(parsed) ? parsed : [parsed];
          } catch (e) {
            // If not JSON, treat as single quantity
            quantitiesArray = [parseFloat(ingredientQuantities) || 50];
          }
        }
      }

      // Handle units - can be array of strings or single string
      if (ingredientUnits) {
        if (Array.isArray(ingredientUnits)) {
          unitsArray = ingredientUnits;
        } else if (typeof ingredientUnits === 'string') {
          unitsArray = [ingredientUnits];
        }
      }

      // Ensure all arrays have the same length by padding with defaults
      const maxLength = Math.max(ingredientsArray.length, quantitiesArray.length, unitsArray.length);

      // Pad ingredients array
      while (ingredientsArray.length < maxLength) {
        ingredientsArray.push('unknown');
      }

      // Pad quantities array with default 50
      while (quantitiesArray.length < maxLength) {
        quantitiesArray.push(50);
      }

      // Pad units array with default 'g'
      while (unitsArray.length < maxLength) {
        unitsArray.push('g');
      }

      console.log('Processing ingredients update:', {
        ingredients: ingredientsArray,
        quantities: quantitiesArray,
        units: unitsArray
      });

      // Debug: Log the exact types and values
      console.log('Debug - Update Array types and values:');
      ingredientsArray.forEach((item, index) => {
        console.log(`  ingredientsArray[${index}]: ${JSON.stringify(item)} (type: ${typeof item}, isArray: ${Array.isArray(item)})`);
      });
      quantitiesArray.forEach((item, index) => {
        console.log(`  quantitiesArray[${index}]: ${JSON.stringify(item)} (type: ${typeof item}, isArray: ${Array.isArray(item)})`);
      });
      unitsArray.forEach((item, index) => {
        console.log(`  unitsArray[${index}]: ${JSON.stringify(item)} (type: ${typeof item}, isArray: ${Array.isArray(item)})`);
      });

      for (let i = 0; i < maxLength; i++) {
        const ingredientName = ingredientsArray[i];
        const quantity = quantitiesArray[i];
        const unit = unitsArray[i];

        if (!ingredientName || ingredientName === 'unknown') {
          console.log(`Skipping ingredient at index ${i} - no name provided`);
          continue;
        }

        // Ensure we have individual values, not arrays
        const finalIngredientName = Array.isArray(ingredientName) ? ingredientName[0] : ingredientName;
        const finalQuantity = Array.isArray(quantity) ? quantity[0] : quantity;
        const finalUnit = Array.isArray(unit) ? unit[0] : unit;

        // Additional safety check - ensure we have primitive values
        if (Array.isArray(finalIngredientName) || Array.isArray(finalQuantity) || Array.isArray(finalUnit)) {
          console.log(` Error: Still have arrays after extraction:`, {
            ingredientName: finalIngredientName,
            quantity: finalQuantity,
            unit: finalUnit
          });
          continue;
        }

        console.log(`Processing ingredient update: ${finalIngredientName}, quantity: ${finalQuantity}, unit: ${finalUnit}`);
        console.log(`Types: ingredientName=${typeof finalIngredientName}, quantity=${typeof finalQuantity}, unit=${typeof finalUnit}`);

        let ingredient = await Ingredient.findOne({ name: finalIngredientName });
        if (!ingredient) {
          ingredient = await Ingredient.create({
            name: finalIngredientName,
            description: `Ingredient: ${finalIngredientName}`,
            category: 'other',
            stock: 1000, // Default stock
            baseUnit: 'g', // Set base unit to grams
            packagingUnit: 'piece', // Set packaging unit to piece
            packagingQuantity: 1, // Set packaging quantity to 1g
            costPerPackage: 0, // Default cost per package
            reorderLevel: 10 // Default reorder level
          });
        }

        // Calculate total quantity needed for all servings
        const totalQuantity = finalQuantity * servings;

        // Final safety check before creating MealIngredient
        console.log(`Final values before MealIngredient.create (update):`);
        console.log(`  mealId: ${meal._id} (type: ${typeof meal._id})`);
        console.log(`  ingredientId: ${ingredient._id} (type: ${typeof ingredient._id})`);
        console.log(`  quantity: ${totalQuantity} (type: ${typeof totalQuantity})`);
        console.log(`  unit: ${finalUnit} (type: ${typeof finalUnit}, isArray: ${Array.isArray(finalUnit)})`);

        if (Array.isArray(finalUnit)) {
          console.log(`❌ CRITICAL ERROR: finalUnit is still an array: ${JSON.stringify(finalUnit)}`);
          console.log(`   Skipping this ingredient to prevent validation error`);
          continue;
        }

        await MealIngredient.create({
          mealId: meal._id,
          ingredientId: ingredient._id,
          quantity: totalQuantity,
          unit: finalUnit
        });

        console.log(`Updated meal-ingredient: ${finalIngredientName} - ${totalQuantity}${finalUnit} for ${servings} servings (${finalQuantity}${finalUnit} per serving)`);
      }
    }

    // Update tags if provided
    if (tags) {
      // Remove existing meal-tag relationships
      await MealTag.deleteMany({ mealId: meal._id });

      // Create new meal-tag relationships
      const parsedTags = JSON.parse(tags);
      for (const tagName of parsedTags) {
        let tag = await Tag.findOne({ name: tagName });
        if (!tag) {
          tag = await Tag.create({
            name: tagName,
            description: `Tag: ${tagName}`
          });
        }
        await MealTag.create({
          mealId: meal._id,
          tagId: tag._id
        });
      }
    }

    // Update allergens if provided
    if (allergens) {
      // Remove existing meal-allergen relationships
      await MealAllergen.deleteMany({ mealId: meal._id });

      // Create new meal-allergen relationships
      const parsedAllergens = JSON.parse(allergens);
      for (const allergenName of parsedAllergens) {
        let allergen = await Allergen.findOne({ name: allergenName });
        if (!allergen) {
          allergen = await Allergen.create({
            name: allergenName,
            description: `Contains ${allergenName}`
          });
        }
        await MealAllergen.create({
          mealId: meal._id,
          allergenId: allergen._id
        });
      }
    }

    // Populate related data to return complete meal information
    const [populatedAllergens, populatedIngredients, populatedTags, availability] = await Promise.all([
      MealAllergen.find({ mealId: meal._id }).populate("allergenId"),
      MealIngredient.find({ mealId: meal._id }).populate("ingredientId"),
      MealTag.find({ mealId: meal._id }).populate("tagId"),
      calculateMealAvailability(meal._id)
    ]);

    const mealWithRelations = {
      ...meal.toObject(),
      allergens: populatedAllergens.map(ma => ma.allergenId),
      ingredients: populatedIngredients.map(mi => ({
        ingredient: mi.ingredientId,
        quantity: mi.quantity,
        unit: mi.unit,
        isOptional: mi.isOptional,
        cost: mi.cost
      })),
      tags: populatedTags.map(mt => mt.tagId),
      availability: {
        available: availability.available,
        availableServings: availability.availableServings,
        totalCost: availability.totalCost,
        missingIngredients: availability.missingIngredients,
        lowStockIngredients: availability.lowStockIngredients
      }
    };

    return SuccessHandler(mealWithRelations, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const deleteMeal = async (req, res) => {
  // #swagger.tags = ['meals']
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      return ErrorHandler("Meal not found", 404, req, res);
    }

    // Delete associated images from Cloudinary
    if (meal.images && meal.images.length > 0) {
      for (const image of meal.images) {
        if (image.public_id) {
          try {
            await deleteImage(image.public_id);
          } catch (deleteError) {
            console.error('Failed to delete image:', deleteError.message);
          }
        }
      }
    }

    meal.isActive = false;
    await meal.save();
    return SuccessHandler({}, 204, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getAllCategories = async (req, res) => {
  // #swagger.tags = ['meals']
  try {
    const filter = {};
    if (typeof req.query.active !== "undefined") {
      filter.isActive = req.query.active === "true";
    }
    const categories = await Category.find(filter);
    return SuccessHandler(categories, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const createCategory = async (req, res) => {
  // #swagger.tags = ['meals']
  try {
    const { category } = req.body;
    const exCategory = await Category.findOne({
      name: category
    });
    if (exCategory) {
      return ErrorHandler("Category already exists", 400, req, res);
    }
    const meal = await Category.create({
      name: category,
    });
    return SuccessHandler(meal, 201, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const updateCategory = async (req, res) => {
  // #swagger.tags = ['meals']
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return ErrorHandler("Category not found", 404, req, res);
    }

    if (typeof name !== "undefined") {
      category.name = name;
    }
    if (typeof isActive !== "undefined") {
      category.isActive = isActive;
    }

    await category.save();
    return SuccessHandler(category, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Upload meal image only
const uploadMealImage = async (req, res) => {
  // #swagger.tags = ['meals']
  try {
    if (!req.file) {
      return ErrorHandler("No image file provided", 400, req, res);
    }

    const uploadResult = await uploadImage(req.file, {
      folder: 'kitchen-planner/meals',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      max_size: 5 * 1024 * 1024
    });

    return SuccessHandler({
      public_id: uploadResult.public_id,
      url: uploadResult.url,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format
    }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Delete meal image
const deleteMealImage = async (req, res) => {
  // #swagger.tags = ['meals']
  try {
    const { mealId, imageId } = req.params;

    const meal = await Meal.findById(mealId);
    if (!meal) {
      return ErrorHandler("Meal not found", 404, req, res);
    }

    // Find and remove the specific image
    const imageIndex = meal.images.findIndex(img => img._id.toString() === imageId);
    if (imageIndex === -1) {
      return ErrorHandler("Image not found", 404, req, res);
    }

    const imageToDelete = meal.images[imageIndex];

    // Delete from Cloudinary
    if (imageToDelete.public_id) {
      await deleteImage(imageToDelete.public_id);
    }

    // Remove from meal images array
    meal.images.splice(imageIndex, 1);
    await meal.save();

    return SuccessHandler({}, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  getAllMeals,
  getMeal,
  createMeal,
  updateMeal,
  deleteMeal,
  getAllCategories,
  createCategory,
  updateCategory,
  uploadMealImage,
  deleteMealImage,
};
