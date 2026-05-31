const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const MealPlan = require("../models/Meals/mealPlan");
const Meal = require("../models/Meals/meals");
const MealIngredient = require("../models/Meals/mealIngredient");
const IngredientBatch = require("../models/Meals/ingredientBatch");
const User = require("../models/User/user");
const MealTag = require("../models/Meals/mealTag");
const Tag = require("../models/Meals/tag");
const Allergen = require("../models/Meals/allergen");
const MealAllergen = require("../models/Meals/mealAllergen");

// Helper function to deduct stock for meal plan
const deductStockForMealPlan = async (meals) => {
  try {
    console.log('Starting stock deduction for meal plan with meals:', meals);
    
    // PHASE 1: Validate that all ingredients have sufficient stock
    console.log('Phase 1: Validating stock availability for all ingredients...');
    const stockValidationResults = [];
    
    for (const mealEntry of meals) {
      const { mealId, servings = 1 } = mealEntry;
      console.log(`Validating meal ${mealId} with ${servings} servings`);
      
      // Get meal ingredients
      const mealIngredients = await MealIngredient.find({ mealId }).populate('ingredientId');
      console.log(`Found ${mealIngredients.length} ingredients for meal ${mealId}`);
      
      for (const mealIngredient of mealIngredients) {
        const ingredient = mealIngredient.ingredientId;
        
        // Calculate proportional stock deduction based on servings
        const meal = await Meal.findById(mealId);
        if (!meal) {
          throw new Error(`Meal ${mealId} not found`);
        }
        
        const mealTotalServings = meal.servings;
        const planServings = servings;
        const proportionalQuantity = (planServings / mealTotalServings) * mealIngredient.quantity;
        
        // Convert ingredient stock from packages to base units for comparison
        const stockInBaseUnits = ingredient.stock * ingredient.packagingQuantity;
        
        console.log(`Validating ingredient: ${ingredient.name}`);
        console.log(`  - Meal total servings: ${mealTotalServings}`);
        console.log(`  - Plan servings: ${planServings}`);
        console.log(`  - Total ingredient quantity: ${mealIngredient.quantity} ${mealIngredient.unit}`);
        console.log(`  - Proportional quantity needed: ${proportionalQuantity.toFixed(2)} ${mealIngredient.unit}`);
        console.log(`  - Current stock: ${ingredient.stock} ${ingredient.packagingUnit} (${stockInBaseUnits} ${ingredient.baseUnit})`);
        
        // Check if enough stock is available (compare in base units)
        if (stockInBaseUnits < proportionalQuantity) {
          const errorMsg = `Insufficient stock for ${ingredient.name}. Required: ${proportionalQuantity.toFixed(2)} ${mealIngredient.unit}, Available: ${stockInBaseUnits} ${ingredient.baseUnit}`;
          console.log(`❌ ${errorMsg}`);
          throw new Error(errorMsg);
        }
        
        // Store validation result for Phase 2
        stockValidationResults.push({
          ingredient,
          mealIngredient,
          proportionalQuantity,
          packagesToDeduct: proportionalQuantity / ingredient.packagingQuantity
        });
        
        console.log(`✓ Stock validation passed for ${ingredient.name}`);
      }
    }
    
    console.log(`Phase 1 completed: All ${stockValidationResults.length} ingredients have sufficient stock`);
    
    // PHASE 2: Deduct stock for all ingredients (only if Phase 1 passed)
    console.log('Phase 2: Deducting stock for all ingredients...');
    
    for (const validationResult of stockValidationResults) {
      const { ingredient, proportionalQuantity, packagesToDeduct } = validationResult;
      
      // Deduct stock (in packages)
      ingredient.stock -= packagesToDeduct;
      await ingredient.save();
      
      console.log(`✓ Deducted ${packagesToDeduct.toFixed(2)} ${ingredient.packagingUnit} (${proportionalQuantity.toFixed(2)} ${ingredient.baseUnit}) of ${ingredient.name}. New stock: ${ingredient.stock.toFixed(2)} ${ingredient.packagingUnit}`);
    }
    
    console.log('Stock deduction completed successfully');
    return true;
  } catch (error) {
    console.error('Error in stock deduction process:', error);
    throw error;
  }
};

// Helper function to check stock availability without deducting
const checkStockAvailability = async (meals) => {
  try {
    console.log('Checking stock availability for meals without deducting...');
    const stockCheckResults = [];
    
    for (const mealEntry of meals) {
      const { mealId, servings = 1 } = mealEntry;
      console.log(`Checking stock for meal ${mealId} with ${servings} servings`);
      
      const mealIngredients = await MealIngredient.find({ mealId }).populate('ingredientId');
      console.log(`Found ${mealIngredients.length} ingredients for meal ${mealId}`);
      
      for (const mealIngredient of mealIngredients) {
        const ingredient = mealIngredient.ingredientId;
        
        const meal = await Meal.findById(mealId);
        if (!meal) {
          throw new Error(`Meal ${mealId} not found`);
        }
        
        const mealTotalServings = meal.servings;
        const planServings = servings;
        const proportionalQuantity = (planServings / mealTotalServings) * mealIngredient.quantity;
        
        const stockInBaseUnits = ingredient.stock * ingredient.packagingQuantity;
        
        console.log(`Checking ingredient: ${ingredient.name}`);
        console.log(`  - Required: ${proportionalQuantity.toFixed(2)} ${mealIngredient.unit}`);
        console.log(`  - Available: ${stockInBaseUnits} ${ingredient.baseUnit}`);
        
        if (stockInBaseUnits < proportionalQuantity) {
          const errorMsg = `Insufficient stock for ${ingredient.name}. Required: ${proportionalQuantity.toFixed(2)} ${mealIngredient.unit}, Available: ${stockInBaseUnits} ${ingredient.baseUnit}`;
          console.log(`❌ ${errorMsg}`);
          throw new Error(errorMsg);
        }
        
        stockCheckResults.push({
          ingredient: ingredient.name,
          required: proportionalQuantity,
          available: stockInBaseUnits,
          unit: mealIngredient.unit
        });
        
        console.log(`✓ Stock check passed for ${ingredient.name}`);
      }
    }
    
    console.log(`Stock availability check completed: All ${stockCheckResults.length} ingredients have sufficient stock`);
    return stockCheckResults;
  } catch (error) {
    console.error('Error checking stock availability:', error);
    throw error;
  }
};

// Helper function to restore stock for meal plan
const restoreStockForMealPlan = async (meals) => {
  try {
    for (const mealEntry of meals) {
      const { mealId, servings = 1 } = mealEntry;
      
      // Get meal ingredients
      const mealIngredients = await MealIngredient.find({ mealId }).populate('ingredientId');
      
      for (const mealIngredient of mealIngredients) {
        const ingredient = mealIngredient.ingredientId;
        
        // Calculate proportional stock restoration based on servings
        const meal = await Meal.findById(mealEntry.mealId);
        if (!meal) {
          console.error(`Meal ${mealEntry.mealId} not found during stock restoration`);
          continue;
        }
        
        const mealTotalServings = meal.servings;
        const planServings = servings;
        const proportionalQuantity = (planServings / mealTotalServings) * mealIngredient.quantity;
        
        // Calculate how many packages we need to restore
        const packagesToRestore = proportionalQuantity / ingredient.packagingQuantity;
        
        // Restore stock (in packages)
        ingredient.stock += packagesToRestore;
        await ingredient.save();
        
        console.log(`Restored ${packagesToRestore.toFixed(2)} ${ingredient.packagingUnit} (${proportionalQuantity.toFixed(2)} ${ingredient.baseUnit}) of ${ingredient.name} from meal plan. New stock: ${ingredient.stock.toFixed(2)} ${ingredient.packagingUnit}`);
      }
    }
    return true;
  } catch (error) {
    console.error('Error restoring stock for meal plan:', error);
    throw error;
  }
};

// Create a new meal plan (supports daily and weekly)
const createMealPlan = async (req, res) => {
  try {
    const { date, startDate, endDate, meals, type = "day", createdBy, assignedStaff, notes, mealTimeType } = req.body;
    
    // Validation
    if (type === "day") {
      if (!date) return ErrorHandler("'date' is required for daily plans", 400, req, res);
    } else if (type === "week") {
      if (!startDate || !endDate) return ErrorHandler("'startDate' and 'endDate' are required for weekly plans", 400, req, res);
    }
    
    // Check if meals array is provided and not empty
    if (!meals || !Array.isArray(meals) || meals.length === 0) {
      return ErrorHandler("'meals' array is required and cannot be empty", 400, req, res);
    }
    
    // Build meal plan object
    const mealPlanData = { meals, type, createdBy, assignedStaff, notes, mealTimeType };
    if (type === "day") mealPlanData.date = date;
    if (type === "week") {
      mealPlanData.startDate = startDate;
      mealPlanData.endDate = endDate;
    }
    
    // PHASE 1: Validate stock availability BEFORE creating the meal plan
    console.log(`Validating stock availability for meal plan before creation...`);
    try {
      await checkStockAvailability(meals);
      console.log(`✓ All ingredients have sufficient stock. Proceeding with meal plan creation...`);
    } catch (validationError) {
      console.error(`❌ Pre-validation error:`, validationError.message);
      return ErrorHandler(`Cannot create meal plan: ${validationError.message}`, 400, req, res);
    }
    
    // PHASE 2: Create the meal plan (stock validation has already passed)
    const mealPlan = await MealPlan.create(mealPlanData);
    console.log(`✓ Meal plan ${mealPlan._id} created successfully`);
    
    // PHASE 3: Deduct stock for all meals in the plan
    console.log(`About to deduct stock for meal plan ${mealPlan._id} with meals:`, meals);
    try {
      await deductStockForMealPlan(meals);
      console.log(`✓ Stock deducted successfully for meal plan ${mealPlan._id}`);
    } catch (stockError) {
      console.error(`❌ Stock deduction failed for meal plan ${mealPlan._id}:`, stockError.message);
      // If stock deduction fails after meal plan creation, delete the meal plan and return error
      // This should not happen since we pre-validated, but it's a safety measure
      await MealPlan.findByIdAndDelete(mealPlan._id);
      return ErrorHandler(`Failed to create meal plan due to stock deduction error: ${stockError.message}`, 500, req, res);
    }
    
    return SuccessHandler(mealPlan, 201, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Get meal plans for a specific day or week or range
const getMealPlans = async (req, res) => {
  try {
    const { date, type, startDate, endDate, mealTimeType } = req.query;
    let query = {};

    // Build date/type query
    if (type === "day" && date) {
      query = { type: "day", date: new Date(date) };
    } else if (type === "week" && startDate && endDate) {
      query = {
        type: "week",
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(startDate) }
      };
    } else if (date) {
      query.$or = [
        { type: "day", date: new Date(date) },
        {
          type: "week",
          startDate: { $lte: new Date(date) },
          endDate: { $gte: new Date(date) }
        }
      ];
    } else if (startDate && endDate) {
      query.$or = [
        { type: "day", date: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        {
          type: "week",
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) }
        }
      ];
    }

    if (mealTimeType && mealTimeType !== "all") {
      query["meals.mealTimeType"] = mealTimeType;
    }

    const plans = await MealPlan.find(query)
      .populate({
        path: "meals.mealId",
        populate: [
          { path: "nutritionalInfo", model: "NutritionalInfo" },
          { path: "category", model: "Category" },
          { path: "dietaryInfo", model: "DietaryInfo" }
        ]
      })
      .populate("assignedStaff")
      .populate("createdBy");

    const mealIds = plans.flatMap(plan =>
      plan.meals.map(m => m.mealId?._id).filter(Boolean)
    );

    const [mealTags, mealAllergens] = await Promise.all([
      MealTag.find({ mealId: { $in: mealIds } }),
      MealAllergen.find({ mealId: { $in: mealIds } })
    ]);

    const [tags, allergens] = await Promise.all([
      Tag.find({ _id: { $in: [...new Set(mealTags.map(mt => mt.tagId))] } }),
      Allergen.find({ _id: { $in: [...new Set(mealAllergens.map(ma => ma.allergenId))] } })
    ]);

    const tagsMap = mealTags.reduce((acc, mt) => {
      acc[mt.mealId] = acc[mt.mealId] || [];
      const tagDoc = tags.find(t => t._id.equals(mt.tagId));
      if (tagDoc) acc[mt.mealId].push({ _id: tagDoc._id, name: tagDoc.name });
      return acc;
    }, {});

    const allergensMap = mealAllergens.reduce((acc, ma) => {
      acc[ma.mealId] = acc[ma.mealId] || [];
      const allergenDoc = allergens.find(a => a._id.equals(ma.allergenId));
      if (allergenDoc) acc[ma.mealId].push({ _id: allergenDoc._id, name: allergenDoc.name });
      return acc;
    }, {});

    const flattenedPlans = plans.map(plan => ({
      ...plan.toObject(),
      meals: plan.meals
        .map(m => {
          const meal = m.mealId?.toObject();
          console.log(meal);
          if (!meal) return null;

          return {
            _id: m._id,
            servings: m.servings,
            cookTime: meal.cookTime,
            mealType: meal.mealType,
            servingStart: meal.servingStart,
            servingEnd: meal.servingEnd,
            mealTimeType: m.mealTimeType,
            mealId: {
              _id: meal._id,
              title: meal.title,
              description: meal.description,
              servings: meal.servings,
              price: meal.price,
              category: meal.category,
              images: meal.images,
              isActive: meal.isActive,
              createdAt: meal.createdAt,
              updatedAt: meal.updatedAt,
              dietaryInfo: meal.dietaryInfo,
              nutritionalInfo: meal.nutritionalInfo,
              tags: tagsMap[meal._id] || [],
              allergens: allergensMap[meal._id] || []
            }
          };
        })
        .filter(Boolean)
    }));

    return SuccessHandler(flattenedPlans, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};


// Get a single meal plan by ID
const getMealPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const mealPlan = await MealPlan.findById(id)
      .populate("meals.mealId")
      .populate("assignedStaff")
      .populate("createdBy");
    
    if (!mealPlan) {
      return ErrorHandler("Meal plan not found", 404, req, res);
    }
    
    return SuccessHandler(mealPlan, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Get available meals for planning
const getAvailableMeals = async (req, res) => {
  try {
    const { type, date, startDate, endDate, category, dietary } = req.query;
    
    // Validate date parameters
    if (date && isNaN(Date.parse(date))) {
      return ErrorHandler("Invalid date format. Use YYYY-MM-DD", 400, req, res);
    }
    if (startDate && isNaN(Date.parse(startDate))) {
      return ErrorHandler("Invalid startDate format. Use YYYY-MM-DD", 400, req, res);
    }
    if (endDate && isNaN(Date.parse(endDate))) {
      return ErrorHandler("Invalid endDate format. Use YYYY-MM-DD", 400, req, res);
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return ErrorHandler("startDate cannot be after endDate", 400, req, res);
    }
    
    // Build query filters
    let query = { isActive: true };
    
    // Add date filtering based on meal plans
    if (type === "day" && date) {
      // For daily meals, check if there's a meal plan for this specific date
      const existingMealPlan = await MealPlan.findOne({
        type: "day",
        date: new Date(date)
      });
      
      if (existingMealPlan) {
        // If meal plan exists for this date, exclude those meals
        const plannedMealIds = existingMealPlan.meals.map(m => m.mealId);
        query._id = { $nin: plannedMealIds };
      }
    } else if (type === "week" && startDate && endDate) {
      // For weekly meals, check if there are meal plans overlapping this date range
      const overlappingMealPlans = await MealPlan.find({
        type: "week",
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(startDate) }
      });
      
      if (overlappingMealPlans.length > 0) {
        // If meal plans exist for this range, exclude those meals
        const plannedMealIds = overlappingMealPlans.flatMap(plan => 
          plan.meals.map(m => m.mealId)
        );
        query._id = { $nin: plannedMealIds };
      }
    } else if (date) {
      // If only date is provided, check both daily and weekly plans that cover this date
      const [dailyPlan, weeklyPlans] = await Promise.all([
        MealPlan.findOne({ type: "day", date: new Date(date) }),
        MealPlan.find({
          type: "week",
          startDate: { $lte: new Date(date) },
          endDate: { $gte: new Date(date) }
        })
      ]);
      
      const plannedMealIds = [];
      if (dailyPlan) {
        plannedMealIds.push(...dailyPlan.meals.map(m => m.mealId));
      }
      if (weeklyPlans.length > 0) {
        weeklyPlans.forEach(plan => {
          plannedMealIds.push(...plan.meals.map(m => m.mealId));
        });
      }
      
      if (plannedMealIds.length > 0) {
        query._id = { $nin: plannedMealIds };
      }
    } else if (startDate && endDate) {
      // If date range is provided, check all plans overlapping this range
      const overlappingPlans = await MealPlan.find({
        $or: [
          { type: "day", date: { $gte: new Date(startDate), $lte: new Date(endDate) } },
          { type: "week", startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
        ]
      });
      
      if (overlappingPlans.length > 0) {
        const plannedMealIds = overlappingPlans.flatMap(plan => 
          plan.meals.map(m => m.mealId)
        );
        query._id = { $nin: plannedMealIds };
      }
    }
    
    // Add category filter
    if (category && category !== "all") {
      query.category = category;
    }
    
    // Add dietary filter
    if (dietary) {
      query.dietaryInfo = dietary;
    }
    
    // Get meals based on the query
    console.log('🔍 Available meals query:', JSON.stringify(query, null, 2));
    
    const meals = await Meal.find(query)
      .populate('category')
      .populate('dietaryInfo');
    
    console.log(`✅ Found ${meals.length} meals after filtering`);
    
    // Get all meal ingredients for these meals
    const mealIngredients = await MealIngredient.find({
      mealId: { $in: meals.map(meal => meal._id) }
    }).populate('ingredientId');
    
    // Group ingredients by meal
    const ingredientsByMeal = {};
    mealIngredients.forEach(mi => {
      if (!ingredientsByMeal[mi.mealId]) {
        ingredientsByMeal[mi.mealId] = [];
      }
      ingredientsByMeal[mi.mealId].push(mi);
    });
    
    // Filter meals that are available for planning and calculate availability
    const availableMeals = meals.filter(meal => {
      const mealIngredients = ingredientsByMeal[meal._id] || [];
      
      // Check if meal has ingredients
      if (mealIngredients.length === 0) {
        return false;
      }
      
      // Check if all ingredients have sufficient stock for at least 1 serving
      const hasSufficientStock = mealIngredients.every(mi => {
        const ingredient = mi.ingredientId;
        if (!ingredient) return false;
        
        // Calculate required quantity in base units
        const requiredQuantity = mi.quantity;
        const availableStock = ingredient.stock * ingredient.packagingQuantity;
        
        // Check if stock is sufficient (at least 1 serving worth)
        return availableStock >= requiredQuantity;
      });
      
      return hasSufficientStock;
    });
    
    // Format the response with improved availability logic
    const formattedMeals = availableMeals.map(meal => {
      const mealIngredients = ingredientsByMeal[meal._id] || [];
      
      // Calculate availability details
      let availableServings = Infinity;
      let totalCost = 0;
      let missingIngredients = [];
      let lowStockIngredients = [];
      
      // Calculate available servings based on most limiting ingredient
      mealIngredients.forEach(mi => {
        const ingredient = mi.ingredientId;
        if (ingredient) {
          const availableStock = ingredient.stock * ingredient.packagingQuantity;
          const requiredPerServing = mi.quantity;
          
          // Calculate how many servings we can make with this ingredient
          const servingsPossible = Math.floor(availableStock / requiredPerServing);
          availableServings = Math.min(availableServings, servingsPossible);
          
          // Calculate cost for this ingredient per serving
          const ingredientCostPerServing = (mi.cost || 0) * (requiredPerServing / ingredient.packagingQuantity);
          totalCost += ingredientCostPerServing;
          
          // Check for low stock (less than 3 servings worth)
          if (servingsPossible < 3) {
            lowStockIngredients.push({
              ingredientId: ingredient._id,
              name: ingredient.name,
              availableServings: servingsPossible,
              currentStock: ingredient.stock,
              packagingUnit: ingredient.packagingUnit,
              packagingQuantity: ingredient.packagingQuantity
            });
          }
        }
      });
      
      // Ensure availableServings is not Infinity and is at least 1
      availableServings = availableServings === Infinity ? 0 : Math.max(1, availableServings);
      
      // Round total cost to 2 decimal places
      totalCost = Math.round(totalCost * 100) / 100;
      
      return {
        _id: meal._id,
        name: meal.title,
        description: meal.description,
        price: meal.price,
        servings: meal.servings,
        images: meal.images,
        isActive: meal.isActive,
        category: meal.category,
        dietaryInfo: meal.dietaryInfo,
        nutritionalInfo: meal.nutritionalInfo,
        ingredients: mealIngredients.map(mi => ({
          ingredientId: mi.ingredientId,
          quantity: mi.quantity,
          unit: mi.unit,
          isOptional: mi.isOptional,
          cost: mi.cost
        })),
        availability: {
          available: availableServings > 0,
          availableServings: availableServings,
          totalCost: totalCost,
          missingIngredients: missingIngredients,
          lowStockIngredients: lowStockIngredients
        },
        isAvailable: availableServings > 0
      };
    });
    
    return SuccessHandler(formattedMeals, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Check if all ingredients are available for a meal plan (supports daily/weekly)
const checkMealPlanStock = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await MealPlan.findById(id).populate("meals.mealId");
    if (!plan) return ErrorHandler("Meal plan not found", 404, req, res);

    // Aggregate required ingredients
    const ingredientNeeds = {};
    for (const mealEntry of plan.meals) {
      const mealIngredients = await MealIngredient.find({ mealId: mealEntry.mealId });
      for (const mi of mealIngredients) {
        const key = mi.ingredientId.toString();
        if (!ingredientNeeds[key]) ingredientNeeds[key] = 0;
        ingredientNeeds[key] += mi.quantity * mealEntry.servings;
      }
    }

    // Determine the relevant date(s) for expiry checks
    let checkStart, checkEnd;
    if (plan.type === "week") {
      checkStart = plan.startDate;
      checkEnd = plan.endDate;
    } else {
      checkStart = checkEnd = plan.date;
    }

    // Check against available batches (by expiry)
    const ingredientStatus = [];
    let allAvailable = true;
    for (const [ingredientId, requiredQty] of Object.entries(ingredientNeeds)) {
      // Only count batches not expired by the end of the plan
      const batches = await IngredientBatch.find({ ingredientId, expiryDate: { $gte: checkEnd } }).sort({ expiryDate: 1 });
      let availableQty = 0;
      for (const batch of batches) {
        availableQty += batch.baseUnitQuantity || batch.quantity;
        if (availableQty >= requiredQty) break;
      }
      ingredientStatus.push({ ingredientId, requiredQty, availableQty, enough: availableQty >= requiredQty });
      if (availableQty < requiredQty) allAvailable = false;
    }

    return SuccessHandler({ allAvailable, ingredientStatus }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Check if enough staff are available for a meal plan
const checkMealPlanResources = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await MealPlan.findById(id).populate("assignedStaff");
    if (!plan) return ErrorHandler("Meal plan not found", 404, req, res);

    // For demo: just return assigned staff and their roles
    const staffDetails = await User.find({ _id: { $in: plan.assignedStaff } }, "name role");
    // Optionally, check for required roles/skills here

    return SuccessHandler({ assignedStaff: staffDetails }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Delete a meal plan and restore stock
const deleteMealPlan = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the meal plan before deleting
    const mealPlan = await MealPlan.findById(id);
    if (!mealPlan) {
      return ErrorHandler("Meal plan not found", 404, req, res);
    }
    
    // Restore stock for all meals in the plan
    try {
      await restoreStockForMealPlan(mealPlan.meals);
      console.log(`Stock restored successfully for meal plan ${id}`);
    } catch (stockError) {
      console.error('Failed to restore stock:', stockError.message);
      // Continue with deletion even if stock restoration fails
    }
    
    // Delete the meal plan
    await MealPlan.findByIdAndDelete(id);
    
    return SuccessHandler({ message: "Meal plan deleted successfully" }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Update a meal plan and handle stock changes
const updateMealPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startDate, endDate, meals, type, assignedStaff, notes, mealTimeType } = req.body;
    
    // Find the existing meal plan
    const existingMealPlan = await MealPlan.findById(id);
    if (!existingMealPlan) {
      return ErrorHandler("Meal plan not found", 404, req, res);
    }
    
    // Validation
    if (type === "day") {
      if (!date) return ErrorHandler("'date' is required for daily plans", 400, req, res);
    } else if (type === "week") {
      if (!startDate || !endDate) return ErrorHandler("'startDate' and 'endDate' are required for weekly plans", 400, req, res);
    }
    
    // Check if meals array is provided and not empty
    if (!meals || !Array.isArray(meals) || meals.length === 0) {
      return ErrorHandler("'meals' array is required and cannot be empty", 400, req, res);
    }
    
    // PHASE 1: Validate stock availability for new meals BEFORE updating
    console.log(`Validating stock availability for updated meal plan...`);
    try {
      await checkStockAvailability(meals);
      console.log(`✓ All ingredients have sufficient stock for updated meal plan`);
    } catch (validationError) {
      console.error(`❌ Pre-validation error for updated meal plan:`, validationError.message);
      return ErrorHandler(`Cannot update meal plan: ${validationError.message}`, 400, req, res);
    }
    
    // PHASE 2: Restore stock for existing meals
    try {
      await restoreStockForMealPlan(existingMealPlan.meals);
      console.log(`Stock restored for existing meals in meal plan ${id}`);
    } catch (stockError) {
      console.error('Failed to restore stock for existing meals:', stockError.message);
      return ErrorHandler(`Failed to update meal plan: ${stockError.message}`, 400, req, res);
    }
    
    // PHASE 3: Deduct stock for new meals (validation has already passed)
    try {
      await deductStockForMealPlan(meals);
      console.log(`Stock deducted for new meals in meal plan ${id}`);
    } catch (stockError) {
      // If stock deduction fails after validation, try to restore the original meals
      try {
        await deductStockForMealPlan(existingMealPlan.meals);
      } catch (restoreError) {
        console.error('Failed to restore original meals after stock deduction failure:', restoreError.message);
      }
      return ErrorHandler(`Failed to update meal plan due to stock deduction error: ${stockError.message}`, 500, req, res);
    }
    
    // Update the meal plan
    const updateData = { meals, type, assignedStaff, notes, mealTimeType };
    if (type === "day") updateData.date = date;
    if (type === "week") {
      updateData.startDate = startDate;
      updateData.endDate = endDate;
    }
    
    const updatedMealPlan = await MealPlan.findByIdAndUpdate(id, updateData, { new: true });
    
    return SuccessHandler(updatedMealPlan, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  createMealPlan,
  getMealPlans,
  getMealPlanById,
  getAvailableMeals,
  checkMealPlanStock,
  checkMealPlanResources,
  deleteMealPlan,
  updateMealPlan,
  checkStockAvailability
}; 