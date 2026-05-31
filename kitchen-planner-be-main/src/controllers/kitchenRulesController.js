const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const KitchenRules = require("../models/User/kitchenRules");

// Get all kitchen rules
const getAllKitchenRules = async (req, res) => {
  // #swagger.tags = ['kitchen-rules']
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };
    
    // Add search filter if provided
    if (req.query.search) {
      filter.$or = [
        { kitchenId: { $regex: req.query.search, $options: "i" } },
        { rules: { $in: [new RegExp(req.query.search, "i")] } }
      ];
    }

    const kitchenRules = await KitchenRules.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await KitchenRules.countDocuments(filter);

    return SuccessHandler({
      kitchenRules,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Get kitchen rules for the current user's kitchen
const getCurrentUserKitchenRules = async (req, res) => {
  // #swagger.tags = ['kitchen-rules']
  try {
    const userKitchenNo = req.user.kitchenNo;
    
    if (!userKitchenNo) {
      return ErrorHandler("User is not assigned to any kitchen", 400, req, res);
    }

    const kitchenRules = await KitchenRules.findOne({ 
      kitchenId: userKitchenNo, 
      isActive: true 
    });

    if (!kitchenRules) {
      return ErrorHandler("No rules found for this kitchen", 404, req, res);
    }

    return SuccessHandler(kitchenRules, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Get kitchen rules by kitchen ID
const getKitchenRulesByKitchenId = async (req, res) => {
  // #swagger.tags = ['kitchen-rules']
  try {
    const { kitchenId } = req.params;

    const kitchenRules = await KitchenRules.findOne({ 
      kitchenId, 
      isActive: true 
    });

    if (!kitchenRules) {
      return ErrorHandler("Kitchen rules not found for this kitchen", 404, req, res);
    }

    return SuccessHandler(kitchenRules, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Create new kitchen rules
const createKitchenRules = async (req, res) => {
  // #swagger.tags = ['kitchen-rules']
  try {
    const { kitchenId, rules } = req.body;

    // Validate required fields
    if (!kitchenId) {
      return ErrorHandler("Kitchen ID is required", 400, req, res);
    }

    if (!Array.isArray(rules) || rules.length === 0) {
      return ErrorHandler("Rules array is required and must contain at least one rule", 400, req, res);
    }

    // Check if kitchen rules already exist for this kitchen
    const existingRules = await KitchenRules.findOne({ kitchenId });
    if (existingRules) {
      return ErrorHandler("Kitchen rules already exist for this kitchen. Use update instead.", 409, req, res);
    }

    // Validate each rule
    const validatedRules = rules.map(rule => {
      if (typeof rule !== 'string' || rule.trim().length === 0) {
        throw new Error("All rules must be non-empty strings");
      }
      return rule.trim();
    });

    const kitchenRules = new KitchenRules({
      kitchenId,
      rules: validatedRules
    });

    await kitchenRules.save();

    return SuccessHandler(kitchenRules, 201, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Create kitchen rules for the current user's kitchen
const createCurrentUserKitchenRules = async (req, res) => {
  // #swagger.tags = ['kitchen-rules']
  try {
    const { rules } = req.body;
    const userKitchenNo = req.user.kitchenNo;

    if (!userKitchenNo) {
      return ErrorHandler("User is not assigned to any kitchen", 400, req, res);
    }

    if (!Array.isArray(rules) || rules.length === 0) {
      return ErrorHandler("Rules array is required and must contain at least one rule", 400, req, res);
    }

    // Check if kitchen rules already exist for this kitchen
    const existingRules = await KitchenRules.findOne({ kitchenId: userKitchenNo });
    if (existingRules) {
      return ErrorHandler("Kitchen rules already exist for this kitchen. Use update instead.", 409, req, res);
    }

    // Validate each rule
    const validatedRules = rules.map(rule => {
      if (typeof rule !== 'string' || rule.trim().length === 0) {
        throw new Error("All rules must be non-empty strings");
      }
      return rule.trim();
    });

    const kitchenRules = new KitchenRules({
      kitchenId: userKitchenNo,
      rules: validatedRules
    });

    await kitchenRules.save();

    return SuccessHandler(kitchenRules, 201, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Update kitchen rules
const updateKitchenRules = async (req, res) => {
  // #swagger.tags = ['kitchen-rules']
  try {
    const { id } = req.params;
    const { rules } = req.body;

    if (!Array.isArray(rules) || rules.length === 0) {
      return ErrorHandler("Rules array is required and must contain at least one rule", 400, req, res);
    }

    // Validate each rule
    const validatedRules = rules.map(rule => {
      if (typeof rule !== 'string' || rule.trim().length === 0) {
        throw new Error("All rules must be non-empty strings");
      }
      return rule.trim();
    });

    const kitchenRules = await KitchenRules.findByIdAndUpdate(
      id,
      { 
        rules: validatedRules,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!kitchenRules) {
      return ErrorHandler("Kitchen rules not found", 404, req, res);
    }

    return SuccessHandler(kitchenRules, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Update kitchen rules by kitchen ID
const updateKitchenRulesByKitchenId = async (req, res) => {
  // #swagger.tags = ['kitchen-rules']
  try {
    const { kitchenId } = req.params;
    const { rules } = req.body;

    if (!Array.isArray(rules) || rules.length === 0) {
      return ErrorHandler("Rules array is required and must contain at least one rule", 400, req, res);
    }

    // Validate each rule
    const validatedRules = rules.map(rule => {
      if (typeof rule !== 'string' || rule.trim().length === 0) {
        throw new Error("All rules must be non-empty strings");
      }
      return rule.trim();
    });

    const kitchenRules = await KitchenRules.findOneAndUpdate(
      { kitchenId, isActive: true },
      { 
        rules: validatedRules,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!kitchenRules) {
      return ErrorHandler("Kitchen rules not found for this kitchen", 404, req, res);
    }

    return SuccessHandler(kitchenRules, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Add a single rule to existing kitchen rules
const addRule = async (req, res) => {
  // #swagger.tags = ['kitchen-rules']
  try {
    const { kitchenId } = req.params;
    const { rule } = req.body;

    if (!rule || typeof rule !== 'string' || rule.trim().length === 0) {
      return ErrorHandler("Rule is required and must be a non-empty string", 400, req, res);
    }

    const kitchenRules = await KitchenRules.findOneAndUpdate(
      { kitchenId, isActive: true },
      { 
        $push: { rules: rule.trim() },
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!kitchenRules) {
      return ErrorHandler("Kitchen rules not found for this kitchen", 404, req, res);
    }

    return SuccessHandler(kitchenRules, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Remove a specific rule from kitchen rules
const removeRule = async (req, res) => {
  // #swagger.tags = ['kitchen-rules']
  try {
    const { kitchenId, ruleIndex } = req.params;

    const kitchenRules = await KitchenRules.findOne({ kitchenId, isActive: true });
    
    if (!kitchenRules) {
      return ErrorHandler("Kitchen rules not found for this kitchen", 404, req, res);
    }

    const index = parseInt(ruleIndex);
    if (isNaN(index) || index < 0 || index >= kitchenRules.rules.length) {
      return ErrorHandler("Invalid rule index", 400, req, res);
    }

    kitchenRules.rules.splice(index, 1);
    kitchenRules.updatedAt = Date.now();
    await kitchenRules.save();

    return SuccessHandler(kitchenRules, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Delete kitchen rules (soft delete)
const deleteKitchenRules = async (req, res) => {
  // #swagger.tags = ['kitchen-rules']
  try {
    const { id } = req.params;

    const kitchenRules = await KitchenRules.findByIdAndUpdate(
      id,
      { 
        isActive: false,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!kitchenRules) {
      return ErrorHandler("Kitchen rules not found", 404, req, res);
    }

    return SuccessHandler({ message: "Kitchen rules deleted successfully" }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Delete kitchen rules by kitchen ID (soft delete)
const deleteKitchenRulesByKitchenId = async (req, res) => {
  // #swagger.tags = ['kitchen-rules']
  try {
    const { kitchenId } = req.params;

    const kitchenRules = await KitchenRules.findOneAndUpdate(
      { kitchenId, isActive: true },
      { 
        isActive: false,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!kitchenRules) {
      return ErrorHandler("Kitchen rules not found for this kitchen", 404, req, res);
    }

    return SuccessHandler({ message: "Kitchen rules deleted successfully" }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Hard delete kitchen rules (admin only)
const hardDeleteKitchenRules = async (req, res) => {
  // #swagger.tags = ['kitchen-rules']
  try {
    const { id } = req.params;

    const kitchenRules = await KitchenRules.findByIdAndDelete(id);

    if (!kitchenRules) {
      return ErrorHandler("Kitchen rules not found", 404, req, res);
    }

    return SuccessHandler({ message: "Kitchen rules permanently deleted" }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  getAllKitchenRules,
  getCurrentUserKitchenRules,
  getKitchenRulesByKitchenId,
  createKitchenRules,
  createCurrentUserKitchenRules,
  updateKitchenRules,
  updateKitchenRulesByKitchenId,
  addRule,
  removeRule,
  deleteKitchenRules,
  deleteKitchenRulesByKitchenId,
  hardDeleteKitchenRules
};
