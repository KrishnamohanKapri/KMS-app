const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const Ingredient = require("../models/Meals/ingredient");
const IngredientBatch = require("../models/Meals/ingredientBatch");
const { calculateMealAvailability } = require("../utils/mealAvailability");

// Get all ingredients with stock information
const getAllIngredientsWithStock = async (req, res) => {
  // #swagger.tags = ['ingredient-stock']
  try {
    const ingredients = await Ingredient.find({ isActive: true });
    
    // Add stock status to each ingredient
    const ingredientsWithStockStatus = ingredients.map(ingredient => {
      const stockStatus = ingredient.stock <= ingredient.reorderLevel ? 'LOW' : 
                         ingredient.stock === 0 ? 'OUT_OF_STOCK' : 'AVAILABLE';
      
      return {
        ...ingredient.toObject(),
        stockStatus,
        needsReorder: ingredient.stock <= ingredient.reorderLevel
      };
    });

    return SuccessHandler(ingredientsWithStockStatus, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Update ingredient stock
const updateIngredientStock = async (req, res) => {
  // #swagger.tags = ['ingredient-stock']
  try {
    const { ingredientId } = req.params;
    const { stock, costPerUnit, reorderLevel } = req.body;

    const ingredient = await Ingredient.findById(ingredientId);
    if (!ingredient) {
      return ErrorHandler("Ingredient not found", 404, req, res);
    }

    // Update fields if provided
    if (stock !== undefined) {
      ingredient.stock = Math.max(0, stock);
    }
    if (costPerUnit !== undefined) {
      ingredient.costPerUnit = Math.max(0, costPerUnit);
    }
    if (reorderLevel !== undefined) {
      ingredient.reorderLevel = Math.max(0, reorderLevel);
    }

    await ingredient.save();

    return SuccessHandler(ingredient, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Add stock to ingredient
const addStock = async (req, res) => {
  // #swagger.tags = ['ingredient-stock']
  try {
    const { ingredientId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return ErrorHandler("Quantity must be greater than 0", 400, req, res);
    }

    const ingredient = await Ingredient.findById(ingredientId);
    if (!ingredient) {
      return ErrorHandler("Ingredient not found", 404, req, res);
    }

    ingredient.stock += quantity;
    await ingredient.save();

    return SuccessHandler({
      ...ingredient.toObject(),
      stockStatus: ingredient.stock <= ingredient.reorderLevel ? 'LOW' : 'AVAILABLE',
      needsReorder: ingredient.stock <= ingredient.reorderLevel
    }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Add stock to ingredient with batch creation
const addStockWithBatch = async (req, res) => {
  // #swagger.tags = ['ingredient-stock']
  try {
    const { ingredientId } = req.params;
    const { 
      quantity, 
      expiryDate, 
      costPerPackage, 
      supplier, 
      purchaseOrder 
    } = req.body;

    if (!quantity || quantity <= 0) {
      return ErrorHandler("Quantity must be greater than 0", 400, req, res);
    }
    if (!expiryDate) {
      return ErrorHandler("Expiry date is required when creating a batch", 400, req, res);
    }
    if (!costPerPackage || costPerPackage < 0) {
      return ErrorHandler("Cost per package is required when creating a batch", 400, req, res);
    }

    const ingredient = await Ingredient.findById(ingredientId);
    if (!ingredient) {
      return ErrorHandler("Ingredient not found", 404, req, res);
    }

    // Calculate package quantity based on ingredient packaging
    const packageQuantity = quantity / ingredient.packagingQuantity;
    
    // Create the batch
    const batch = await IngredientBatch.create({
      ingredientId,
      packageQuantity,
      baseUnitQuantity: quantity,
      expiryDate,
      receivedDate: new Date(),
      batchNumber: `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      costPerPackage,
      supplier: supplier || 'Unknown',
      purchaseOrder: purchaseOrder || null
    });

    // Update ingredient stock to sum of all non-expired batches
    const now = new Date();
    const batches = await IngredientBatch.find({ ingredientId, expiryDate: { $gte: now } });
    const totalStock = batches.reduce((sum, b) => sum + b.baseUnitQuantity, 0);
    ingredient.stock = totalStock;
    await ingredient.save();

    return SuccessHandler({
      batch,
      updatedStock: totalStock,
      message: `Stock added via batch. Total stock updated to ${totalStock} ${ingredient.baseUnit}`,
      stockStatus: totalStock <= ingredient.reorderLevel ? 'LOW' : 'AVAILABLE',
      needsReorder: totalStock <= ingredient.reorderLevel
    }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Get low stock ingredients
const getLowStockIngredients = async (req, res) => {
  // #swagger.tags = ['ingredient-stock']
  try {
    const lowStockIngredients = await Ingredient.find({
      isActive: true,
      $expr: { $lte: ["$stock", "$reorderLevel"] }
    });

    return SuccessHandler(lowStockIngredients, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Get out of stock ingredients
const getOutOfStockIngredients = async (req, res) => {
  // #swagger.tags = ['ingredient-stock']
  try {
    const outOfStockIngredients = await Ingredient.find({
      isActive: true,
      stock: 0
    });

    return SuccessHandler(outOfStockIngredients, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Get meal availability based on ingredient stock
const getMealAvailability = async (req, res) => {
  // #swagger.tags = ['ingredient-stock']
  try {
    const { mealId } = req.params;
    
    const availability = await calculateMealAvailability(mealId);
    
    return SuccessHandler(availability, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Get stock report
const getStockReport = async (req, res) => {
  // #swagger.tags = ['ingredient-stock']
  try {
    const ingredients = await Ingredient.find({ isActive: true });
    
    const report = {
      totalIngredients: ingredients.length,
      outOfStock: ingredients.filter(i => i.stock === 0).length,
      lowStock: ingredients.filter(i => i.stock > 0 && i.stock <= i.reorderLevel).length,
      available: ingredients.filter(i => i.stock > i.reorderLevel).length,
      totalValue: ingredients.reduce((sum, i) => sum + (i.stock * i.costPerUnit), 0),
      categories: {}
    };

    // Group by category
    ingredients.forEach(ingredient => {
      if (!report.categories[ingredient.category]) {
        report.categories[ingredient.category] = {
          count: 0,
          outOfStock: 0,
          lowStock: 0,
          available: 0
        };
      }
      
      report.categories[ingredient.category].count++;
      
      if (ingredient.stock === 0) {
        report.categories[ingredient.category].outOfStock++;
      } else if (ingredient.stock <= ingredient.reorderLevel) {
        report.categories[ingredient.category].lowStock++;
      } else {
        report.categories[ingredient.category].available++;
      }
    });

    return SuccessHandler(report, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Add a new batch to an ingredient
const addIngredientBatch = async (req, res) => {
  // #swagger.tags = ['ingredient-stock']
  try {
    const { ingredientId } = req.params;
    const { 
      packageQuantity, 
      baseUnitQuantity, 
      expiryDate, 
      receivedDate, 
      batchNumber, 
      costPerPackage, 
      supplier, 
      purchaseOrder 
    } = req.body;

    if (!packageQuantity || packageQuantity <= 0) {
      return ErrorHandler("Package quantity must be greater than 0", 400, req, res);
    }
    if (!baseUnitQuantity || baseUnitQuantity <= 0) {
      return ErrorHandler("Base unit quantity must be greater than 0", 400, req, res);
    }
    if (!expiryDate) {
      return ErrorHandler("Expiry date is required", 400, req, res);
    }
    if (!costPerPackage || costPerPackage < 0) {
      return ErrorHandler("Cost per package is required and must be non-negative", 400, req, res);
    }

    const ingredient = await Ingredient.findById(ingredientId);
    if (!ingredient) {
      return ErrorHandler("Ingredient not found", 404, req, res);
    }

    // Validate that baseUnitQuantity matches packageQuantity * ingredient.packagingQuantity
    const expectedBaseUnitQuantity = packageQuantity * ingredient.packagingQuantity;
    if (Math.abs(baseUnitQuantity - expectedBaseUnitQuantity) > 0.01) { // Allow small floating point differences
      return ErrorHandler(`Base unit quantity should be ${expectedBaseUnitQuantity} (${packageQuantity} packages × ${ingredient.packagingQuantity} ${ingredient.baseUnit} per package)`, 400, req, res);
    }

    const batch = await IngredientBatch.create({
      ingredientId,
      packageQuantity,
      baseUnitQuantity,
      expiryDate,
      receivedDate: receivedDate || new Date(),
      batchNumber: batchNumber || `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      costPerPackage,
      supplier: supplier || 'Unknown',
      purchaseOrder: purchaseOrder || null
    });

    // Update ingredient stock to sum of all non-expired batches
    const now = new Date();
    const batches = await IngredientBatch.find({ ingredientId, expiryDate: { $gte: now } });
    const totalStock = batches.reduce((sum, b) => sum + b.baseUnitQuantity, 0);
    ingredient.stock = totalStock;
    await ingredient.save();

    return SuccessHandler({
      batch,
      updatedStock: totalStock,
      message: `Batch added successfully. Total stock updated to ${totalStock} ${ingredient.baseUnit}`
    }, 201, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// List all batches for an ingredient
const getIngredientBatches = async (req, res) => {
  // #swagger.tags = ['ingredient-stock']
  try {
    const { ingredientId } = req.params;
    const batches = await IngredientBatch.find({ ingredientId }).sort({ expiryDate: 1 });
    return SuccessHandler(batches, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// List all batches that are near expiry (e.g., within 7 days)
const getExpiringBatches = async (req, res) => {
  // #swagger.tags = ['ingredient-stock']
  try {
    const days = parseInt(req.query.days) || 7;
    const now = new Date();
    const soon = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const batches = await IngredientBatch.find({ expiryDate: { $gte: now, $lte: soon } }).populate('ingredientId');
    return SuccessHandler(batches, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Deduct stock from ingredient using FIFO batch logic
const deductStockFromBatches = async (req, res) => {
  // #swagger.tags = ['ingredient-stock']
  try {
    const { ingredientId } = req.params;
    const { quantity, reason = 'Manual deduction' } = req.body;

    if (!quantity || quantity <= 0) {
      return ErrorHandler("Quantity must be greater than 0", 400, req, res);
    }

    const ingredient = await Ingredient.findById(ingredientId);
    if (!ingredient) {
      return ErrorHandler("Ingredient not found", 404, req, res);
    }

    // Get all non-expired batches sorted by expiry date (FIFO)
    const now = new Date();
    const batches = await IngredientBatch.find({ 
      ingredientId, 
      expiryDate: { $gte: now } 
    }).sort({ expiryDate: 1 });

    let remainingToDeduct = quantity;
    let deductedFromBatches = [];
    let totalDeducted = 0;

    for (const batch of batches) {
      if (remainingToDeduct <= 0) break;

      const availableInBatch = batch.baseUnitQuantity;
      const toDeductFromBatch = Math.min(remainingToDeduct, availableInBatch);

      // Update batch quantity
      batch.baseUnitQuantity -= toDeductFromBatch;
      batch.packageQuantity = batch.baseUnitQuantity / ingredient.packagingQuantity;
      
      await batch.save();

      deductedFromBatches.push({
        batchId: batch._id,
        batchNumber: batch.batchNumber,
        deducted: toDeductFromBatch,
        remaining: batch.baseUnitQuantity
      });

      remainingToDeduct -= toDeductFromBatch;
      totalDeducted += toDeductFromBatch;
    }

    if (remainingToDeduct > 0) {
      return ErrorHandler(`Insufficient stock. Only ${totalDeducted} ${ingredient.baseUnit} available out of ${quantity} requested.`, 400, req, res);
    }

    // Update ingredient stock
    const updatedBatches = await IngredientBatch.find({ 
      ingredientId, 
      expiryDate: { $gte: now } 
    });
    const totalStock = updatedBatches.reduce((sum, b) => sum + b.baseUnitQuantity, 0);
    ingredient.stock = totalStock;
    await ingredient.save();

    return SuccessHandler({
      message: `Successfully deducted ${totalDeducted} ${ingredient.baseUnit}`,
      deductedFromBatches,
      totalDeducted,
      updatedStock: totalStock,
      stockStatus: totalStock <= ingredient.reorderLevel ? 'LOW' : 'AVAILABLE',
      needsReorder: totalStock <= ingredient.reorderLevel
    }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Clean up expired batches and update ingredient stock
const cleanupExpiredBatches = async (req, res) => {
  // #swagger.tags = ['ingredient-stock']
  try {
    const now = new Date();
    
    // Find all expired batches
    const expiredBatches = await IngredientBatch.find({ 
      expiryDate: { $lt: now } 
    }).populate('ingredientId');

    if (expiredBatches.length === 0) {
      return SuccessHandler({ 
        message: "No expired batches found",
        cleanedBatches: 0 
      }, 200, res);
    }

    // Group expired batches by ingredient
    const ingredientUpdates = {};
    for (const batch of expiredBatches) {
      const ingredientId = batch.ingredientId._id.toString();
      if (!ingredientUpdates[ingredientId]) {
        ingredientUpdates[ingredientId] = {
          ingredient: batch.ingredientId,
          expiredQuantity: 0,
          batches: []
        };
      }
      ingredientUpdates[ingredientId].expiredQuantity += batch.baseUnitQuantity;
      ingredientUpdates[ingredientId].batches.push(batch._id);
    }

    // Update ingredient stock and delete expired batches
    let cleanedBatches = 0;
    for (const [ingredientId, update] of Object.entries(ingredientUpdates)) {
      // Recalculate stock from non-expired batches
      const validBatches = await IngredientBatch.find({ 
        ingredientId, 
        expiryDate: { $gte: now } 
      });
      const totalStock = validBatches.reduce((sum, b) => sum + b.baseUnitQuantity, 0);
      
      // Update ingredient stock
      update.ingredient.stock = totalStock;
      await update.ingredient.save();

      // Delete expired batches for this ingredient
      await IngredientBatch.deleteMany({ _id: { $in: update.batches } });
      cleanedBatches += update.batches.length;
    }

    return SuccessHandler({
      message: `Cleaned up ${cleanedBatches} expired batches`,
      cleanedBatches,
      ingredientUpdates: Object.values(ingredientUpdates).map(update => ({
        ingredientName: update.ingredient.name,
        expiredQuantity: update.expiredQuantity,
        updatedStock: update.ingredient.stock
      }))
    }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  getAllIngredientsWithStock,
  updateIngredientStock,
  addStock,
  addStockWithBatch,
  getLowStockIngredients,
  getOutOfStockIngredients,
  getMealAvailability,
  getStockReport,
  addIngredientBatch,
  getIngredientBatches,
  getExpiringBatches,
  deductStockFromBatches,
  cleanupExpiredBatches
}; 