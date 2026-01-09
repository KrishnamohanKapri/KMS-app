const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const path = require("path");
const User = require("../models/User/user");
const Attendance = require("../models/User/attendance");
const Meal = require("../models/Meals/meals");
const sendNotification = require("../utils/sendNotification");

// Get all chefs
const getAllChefs = async (req, res) => {
  // #swagger.tags = ['chefs']
  try {
    const searchFilter = req.query.search
      ? {
          $or: [
            { firstName: { $regex: req.query.search, $options: "i" } },
            { lastName: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const chefs = await User.find({ role: "chef", ...searchFilter })
      .skip(skip)
      .limit(limit);
    return SuccessHandler(res, "Chefs retrieved successfully", chefs, 200);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Get chef by ID
const getChefById = async (req, res) => {
  // #swagger.tags = ['chefs']
  try {
    const chef = await User.findById(req.params.id);
    if (!chef) {
      return ErrorHandler("Chef not found", 404, req, res);
    }
    return SuccessHandler(res, "Chef retrieved successfully", chef, 200);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Update chef profile
const updateChefProfile = async (req, res) => {
  // #swagger.tags = ['chefs']
  try {
    const { id } = req.params;
    const { firstName, lastName, email, profileImage } = req.body;

    const chef = await User.findById(id);
    if (!chef) {
      return ErrorHandler("Chef not found", 404, req, res);
    }

    // Update fields
    if (firstName) chef.firstName = firstName;
    if (lastName) chef.lastName = lastName;
    if (email) chef.email = email;
    if (profileImage) chef.profileImage = profileImage;

    await chef.save();

    return SuccessHandler(res, "Chef profile updated successfully", chef, 200);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Send notification to chef
const sendChefNotification = async (req, res) => {
  // #swagger.tags = ['chefs']
  try {
    const { chefId, title, message, type, data } = req.body;

    await sendNotification(chefId, title, message, type, data);
    SuccessHandler(res, "Notification sent successfully", null, 200);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Mark chef attendance
const markChefAttendance = async (req, res) => {
  // #swagger.tags = ['chefs']
  try {
    const { chefId, date, status, checkInTime, checkOutTime, notes } = req.body;

    // Check if attendance already exists for this date
    let attendance = await Attendance.findOne({
      chef: chefId,
      date: new Date(date),
    });

    if (attendance) {
      // Update existing attendance
      attendance.status = status;
      if (checkInTime) attendance.checkInTime = checkInTime;
      if (checkOutTime) attendance.checkOutTime = checkOutTime;
      if (notes) attendance.notes = notes;
    } else {
      // Create new attendance record
      attendance = new Attendance({
        chef: chefId,
        date: new Date(date),
        status,
        checkInTime,
        checkOutTime,
        notes,
      });
    }

    await attendance.save();

    return SuccessHandler(res, "Attendance marked successfully", attendance, 200);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Get chef attendance
const getChefAttendance = async (req, res) => {
  // #swagger.tags = ['chefs']
  try {
    const { chefId, startDate, endDate } = req.query;

    const query = { chef: chefId };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const attendance = await Attendance.find(query)
      .populate("chef", "firstName lastName email")
      .sort({ date: -1 });

    return SuccessHandler(res, "Attendance retrieved successfully", attendance, 200);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Check low stock ingredients for a specific meal
const lowStock = async (req, res) => {
  // #swagger.tags = ['chefs']
  try {
    const { mealId } = req.params;
    
    // Find the meal and populate its ingredients
    const meal = await Meal.findById(mealId).populate('ingredients.ingredient');
    
    if (!meal) {
      return ErrorHandler("Meal not found", 404, req, res);
    }
    
    // Check for low stock ingredients
    const lowStockIngredients = [];
    
    for (const mealIngredient of meal.ingredients) {
      const ingredient = mealIngredient.ingredient;
      if (ingredient && ingredient.stock <= ingredient.reorderLevel) {
        lowStockIngredients.push({
          ingredientId: ingredient._id,
          ingredientName: ingredient.name,
          currentStock: ingredient.stock,
          reorderLevel: ingredient.reorderLevel,
          requiredQuantity: mealIngredient.quantity,
          unit: ingredient.unit
        });
      }
    }
    
    return SuccessHandler(res, "Low stock ingredients checked successfully", {
      mealId: meal._id,
      mealName: meal.name,
      lowStockIngredients,
      totalLowStock: lowStockIngredients.length
    }, 200);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  getAllChefs,
  getChefById,
  updateChefProfile,
  sendChefNotification,
  markChefAttendance,
  getChefAttendance,
  lowStock,
};
