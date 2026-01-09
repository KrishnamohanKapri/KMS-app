const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const Allergen = require("../models/Meals/allergen");
const Ingredient = require("../models/Meals/ingredient");
const Tag = require("../models/Meals/tag");
const MealAllergen = require("../models/Meals/mealAllergen");
const MealIngredient = require("../models/Meals/mealIngredient");
const MealTag = require("../models/Meals/mealTag");

// Allergen Controllers
const getAllAllergens = async (req, res) => {
  // #swagger.tags = ['allergens']
  try {
    const allergens = await Allergen.find();
    return SuccessHandler(allergens, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const createAllergen = async (req, res) => {
  // #swagger.tags = ['allergens']
  try {
    const { name, description } = req.body;
    
    const existingAllergen = await Allergen.findOne({ name });
    if (existingAllergen) {
      return ErrorHandler("Allergen already exists", 400, req, res);
    }

    const allergen = await Allergen.create({ name, description });
    return SuccessHandler(allergen, 201, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const updateAllergen = async (req, res) => {
  // #swagger.tags = ['allergens']
  try {
    const { name, description } = req.body;
    const allergen = await Allergen.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );
    
    if (!allergen) {
      return ErrorHandler("Allergen not found", 404, req, res);
    }
    
    return SuccessHandler(allergen, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const deleteAllergen = async (req, res) => {
  // #swagger.tags = ['allergens']
  try {
    const allergen = await Allergen.findById(req.params.id);
    if (!allergen) {
      return ErrorHandler("Allergen not found", 404, req, res);
    }
    
    allergen.isActive = false;
    await allergen.save();
    
    return SuccessHandler({}, 204, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Ingredient Controllers
const getAllIngredients = async (req, res) => {
  // #swagger.tags = ['ingredients']
  try {
    const ingredients = await Ingredient.find({ isActive: true });
    return SuccessHandler(ingredients, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const createIngredient = async (req, res) => {
  // #swagger.tags = ['ingredients']
  try {
    const { 
      name, 
      description, 
      category,
      stock = 0,
      baseUnit = 'g',
      packagingUnit = 'piece',
      packagingQuantity = 1,
      costPerPackage = 0,
      reorderLevel = 10
    } = req.body;
    
    const existingIngredient = await Ingredient.findOne({ name });
    if (existingIngredient) {
      return ErrorHandler("Ingredient already exists", 400, req, res);
    }

    const ingredient = await Ingredient.create({ 
      name, 
      description, 
      category,
      stock,
      baseUnit,
      packagingUnit,
      packagingQuantity,
      costPerPackage,
      reorderLevel
    });
    return SuccessHandler(ingredient, 201, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const updateIngredient = async (req, res) => {
  // #swagger.tags = ['ingredients']
  try {
    const { 
      name, 
      description, 
      category,
      stock,
      baseUnit,
      packagingUnit,
      packagingQuantity,
      costPerPackage,
      reorderLevel
    } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (stock !== undefined) updateData.stock = stock;
    if (baseUnit !== undefined) updateData.baseUnit = baseUnit;
    if (packagingUnit !== undefined) updateData.packagingUnit = packagingUnit;
    if (packagingQuantity !== undefined) updateData.packagingQuantity = packagingQuantity;
    if (costPerPackage !== undefined) updateData.costPerPackage = costPerPackage;
    if (reorderLevel !== undefined) updateData.reorderLevel = reorderLevel;
    
    const ingredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!ingredient) {
      return ErrorHandler("Ingredient not found", 404, req, res);
    }
    
    return SuccessHandler(ingredient, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const deleteIngredient = async (req, res) => {
  // #swagger.tags = ['ingredients']
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return ErrorHandler("Ingredient not found", 404, req, res);
    }
    
    ingredient.isActive = false;
    await ingredient.save();
    
    return SuccessHandler({}, 204, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Tag Controllers
const getAllTags = async (req, res) => {
  // #swagger.tags = ['tags']
  try {
    const tags = await Tag.find();
    return SuccessHandler(tags, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const createTag = async (req, res) => {
  // #swagger.tags = ['tags']
  try {
    const { name, description, color } = req.body;
    
    const existingTag = await Tag.findOne({ name });
    if (existingTag) {
      return ErrorHandler("Tag already exists", 400, req, res);
    }

    const tag = await Tag.create({ name, description, color });
    return SuccessHandler(tag, 201, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const updateTag = async (req, res) => {
  // #swagger.tags = ['tags']
  try {
    const { name, description, color } = req.body;
    const tag = await Tag.findByIdAndUpdate(
      req.params.id,
      { name, description, color },
      { new: true }
    );
    
    if (!tag) {
      return ErrorHandler("Tag not found", 404, req, res);
    }
    
    return SuccessHandler(tag, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const deleteTag = async (req, res) => {
  // #swagger.tags = ['tags']
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      return ErrorHandler("Tag not found", 404, req, res);
    }
    
    tag.isActive = false;
    await tag.save();
    
    return SuccessHandler({}, 204, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Meal Relationship Controllers
const addAllergenToMeal = async (req, res) => {
  // #swagger.tags = ['meal-relationships']
  try {
    const { mealId, allergenId } = req.body;
    
    const existingRelation = await MealAllergen.findOne({ mealId, allergenId });
    if (existingRelation) {
      return ErrorHandler("Allergen already added to this meal", 400, req, res);
    }

    const mealAllergen = await MealAllergen.create({ mealId, allergenId });
    return SuccessHandler(mealAllergen, 201, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const removeAllergenFromMeal = async (req, res) => {
  // #swagger.tags = ['meal-relationships']
  try {
    const { mealId, allergenId } = req.params;
    
    const mealAllergen = await MealAllergen.findOneAndDelete({ mealId, allergenId });
    if (!mealAllergen) {
      return ErrorHandler("Allergen not found in this meal", 404, req, res);
    }
    
    return SuccessHandler({}, 204, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const addIngredientToMeal = async (req, res) => {
  // #swagger.tags = ['meal-relationships']
  try {
    const { mealId, ingredientId, quantity, unit, isOptional } = req.body;
    
    const existingRelation = await MealIngredient.findOne({ mealId, ingredientId });
    if (existingRelation) {
      return ErrorHandler("Ingredient already added to this meal", 400, req, res);
    }

    const mealIngredient = await MealIngredient.create({ 
      mealId, 
      ingredientId, 
      quantity, 
      unit, 
      isOptional 
    });
    return SuccessHandler(mealIngredient, 201, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const updateMealIngredient = async (req, res) => {
  // #swagger.tags = ['meal-relationships']
  try {
    const { mealId, ingredientId } = req.params;
    const { quantity, unit, isOptional } = req.body;
    
    const mealIngredient = await MealIngredient.findOneAndUpdate(
      { mealId, ingredientId },
      { quantity, unit, isOptional },
      { new: true }
    );
    
    if (!mealIngredient) {
      return ErrorHandler("Ingredient not found in this meal", 404, req, res);
    }
    
    return SuccessHandler(mealIngredient, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const removeIngredientFromMeal = async (req, res) => {
  // #swagger.tags = ['meal-relationships']
  try {
    const { mealId, ingredientId } = req.params;
    
    const mealIngredient = await MealIngredient.findOneAndDelete({ mealId, ingredientId });
    if (!mealIngredient) {
      return ErrorHandler("Ingredient not found in this meal", 404, req, res);
    }
    
    return SuccessHandler({}, 204, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const addTagToMeal = async (req, res) => {
  // #swagger.tags = ['meal-relationships']
  try {
    const { mealId, tagId } = req.body;
    
    const existingRelation = await MealTag.findOne({ mealId, tagId });
    if (existingRelation) {
      return ErrorHandler("Tag already added to this meal", 400, req, res);
    }

    const mealTag = await MealTag.create({ mealId, tagId });
    return SuccessHandler(mealTag, 201, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const removeTagFromMeal = async (req, res) => {
  // #swagger.tags = ['meal-relationships']
  try {
    const { mealId, tagId } = req.params;
    
    const mealTag = await MealTag.findOneAndDelete({ mealId, tagId });
    if (!mealTag) {
      return ErrorHandler("Tag not found in this meal", 404, req, res);
    }
    
    return SuccessHandler({}, 204, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  // Allergen controllers
  getAllAllergens,
  createAllergen,
  updateAllergen,
  deleteAllergen,
  
  // Ingredient controllers
  getAllIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  
  // Tag controllers
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
  
  // Meal relationship controllers
  addAllergenToMeal,
  removeAllergenFromMeal,
  addIngredientToMeal,
  updateMealIngredient,
  removeIngredientFromMeal,
  addTagToMeal,
  removeTagFromMeal
}; 