const MealIngredient = require("../models/Meals/mealIngredient");
const Ingredient = require("../models/Meals/ingredient");

/**
 * Calculate meal availability based on ingredient stock
 * @param {string} mealId - The meal ID
 * @returns {Object} Availability and cost information
 */
const calculateMealAvailability = async (mealId) => {
  try {
    // Get all ingredients for the meal with their quantities
    const mealIngredients = await MealIngredient.find({ mealId })
      .populate('ingredientId')
      .lean();

    if (!mealIngredients.length) {
      return {
        available: false,
        availableServings: 0,
        totalCost: 0,
        missingIngredients: [],
        lowStockIngredients: []
      };
    }

    let availableServings = Infinity;
    let totalCost = 0;
    const missingIngredients = [];
    const lowStockIngredients = [];

    // Calculate availability for each ingredient
    for (const mealIngredient of mealIngredients) {
      const ingredient = mealIngredient.ingredientId;
      
      if (!ingredient || !ingredient.isActive) {
        missingIngredients.push({
          name: ingredient?.name || 'Unknown',
          required: mealIngredient.quantity,
          unit: mealIngredient.unit
        });
        availableServings = 0;
        continue;
      }

      // Calculate how many servings can be made with current stock
      const servingsPossible = Math.floor(ingredient.stock / mealIngredient.quantity);
      
      if (servingsPossible === 0) {
        missingIngredients.push({
          name: ingredient.name,
          required: mealIngredient.quantity,
          available: ingredient.stock,
          unit: mealIngredient.unit
        });
        availableServings = 0;
      } else if (servingsPossible < availableServings) {
        availableServings = servingsPossible;
      }

      // Check for low stock (below reorder level)
      if (ingredient.stock <= ingredient.reorderLevel) {
        lowStockIngredients.push({
          name: ingredient.name,
          currentStock: ingredient.stock,
          reorderLevel: ingredient.reorderLevel,
          unit: ingredient.unit
        });
      }

      // Calculate cost for this ingredient
      const ingredientCost = (ingredient.costPerUnit * mealIngredient.quantity);
      totalCost += ingredientCost;
    }

    return {
      available: availableServings > 0,
      availableServings: Math.max(0, availableServings),
      totalCost: Math.round(totalCost * 100) / 100, // Round to 2 decimal places
      missingIngredients,
      lowStockIngredients
    };
  } catch (error) {
    console.error('Error calculating meal availability:', error);
    throw error;
  }
};

/**
 * Calculate availability for multiple meals
 * @param {Array} mealIds - Array of meal IDs
 * @returns {Array} Array of meal availability objects
 */
const calculateMultipleMealAvailability = async (mealIds) => {
  const results = [];
  
  for (const mealId of mealIds) {
    const availability = await calculateMealAvailability(mealId);
    results.push({
      mealId,
      ...availability
    });
  }
  
  return results;
};

/**
 * Update ingredient stock after order
 * @param {string} mealId - The meal ID
 * @param {number} servings - Number of servings ordered
 * @returns {boolean} Success status
 */
const updateIngredientStock = async (mealId, servings) => {
  try {
    const mealIngredients = await MealIngredient.find({ mealId })
      .populate('ingredientId');

    for (const mealIngredient of mealIngredients) {
      const ingredient = mealIngredient.ingredientId;
      const stockToDeduct = mealIngredient.quantity * servings;
      
      if (ingredient.stock < stockToDeduct) {
        throw new Error(`Insufficient stock for ${ingredient.name}`);
      }
      
      // Update ingredient stock
      ingredient.stock -= stockToDeduct;
      await ingredient.save();
    }
    
    return true;
  } catch (error) {
    console.error('Error updating ingredient stock:', error);
    throw error;
  }
};

/**
 * Check if meal can be prepared
 * @param {string} mealId - The meal ID
 * @param {number} servings - Number of servings requested
 * @returns {boolean} Can be prepared
 */
const canPrepareMeal = async (mealId, servings = 1) => {
  const availability = await calculateMealAvailability(mealId);
  return availability.available && availability.availableServings >= servings;
};

module.exports = {
  calculateMealAvailability,
  calculateMultipleMealAvailability,
  updateIngredientStock,
  canPrepareMeal
}; 