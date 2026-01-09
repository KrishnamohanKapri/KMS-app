const Customer = require("../models/User/customer");
const User = require("../models/User/user");
const ApiError = require("../utils/ApiError");
const SuccessHandler = require("../utils/SuccessHandler");
const mongoose = require("mongoose");

// Create a new customer
const createCustomer = async (req, res, next) => {
  try {
    const { userId, billingInfo, preferences } = req.body;

    // Validate userId format
    if (!userId) {
      return next(new ApiError("userId is required", 400));
    }

    // Check if userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return next(new ApiError("Invalid userId format. Must be a valid MongoDB ObjectId", 400));
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return next(new ApiError("User not found", 404));
    }

    // Check if customer already exists for this user
    const existingCustomer = await Customer.findOne({ user: userId });
    if (existingCustomer) {
      return next(new ApiError("Customer already exists for this user", 400));
    }

    const customer = new Customer({
      user: userId,
      billingInfo,
      preferences,
    });

    await customer.save();

    // Populate user details
    await customer.populate("user", "firstName lastName email");

    SuccessHandler(res, "Customer created successfully", customer, 201);
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// Get all customers
const getAllCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { "billingInfo.firstName": { $regex: search, $options: "i" } },
        { "billingInfo.lastName": { $regex: search, $options: "i" } },
        { "billingInfo.email": { $regex: search, $options: "i" } },
        { customerId: { $regex: search, $options: "i" } },
      ];
    }

    const customers = await Customer.find(query)
      .populate("user", "firstName lastName email role")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Customer.countDocuments(query);

    SuccessHandler(res, "Customers retrieved successfully", {
      customers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// Get customer by ID
const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate id format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError("Invalid customer ID format. Must be a valid MongoDB ObjectId", 400));
    }

    const customer = await Customer.findById(id)
      .populate("user", "firstName lastName email role")
      .populate({
        path: "orders",
        select: "orderId total status createdAt",
        options: { sort: { createdAt: -1 }, limit: 10 },
      });

    if (!customer) {
      return next(new ApiError("Customer not found", 404));
    }

    SuccessHandler(res, "Customer retrieved successfully", customer);
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// Get customer by user ID
const getCustomerByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return next(new ApiError("Invalid userId format. Must be a valid MongoDB ObjectId", 400));
    }
    
    console.log("Searching for customer with userId:", userId);

    const customer = await Customer.findOne({ user: userId })
      .populate("user", "firstName lastName email role");

    if (!customer) {
      console.log("Customer not found for userId:", userId);
      return next(new ApiError("Customer not found", 404));
    }

    console.log("Customer found:", customer);
    SuccessHandler(res, "Customer retrieved successfully", customer);
  } catch (error) {
    console.error("Error in getCustomerByUserId:", error.message);
    next(new ApiError(error.message, 500));
  }
};

// Update customer
const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate id format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError("Invalid customer ID format. Must be a valid MongoDB ObjectId", 400));
    }
    
    const { billingInfo, preferences, status, notes } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return next(new ApiError("Customer not found", 404));
    }

    // Update fields
    if (billingInfo) customer.billingInfo = { ...customer.billingInfo, ...billingInfo };
    if (preferences) customer.preferences = { ...customer.preferences, ...preferences };
    if (status) customer.status = status;
    if (notes !== undefined) customer.notes = notes;

    await customer.save();
    await customer.populate("user", "firstName lastName email role");

    SuccessHandler(res, "Customer updated successfully", customer);
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// Update customer billing info
const updateBillingInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate id format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError("Invalid customer ID format. Must be a valid MongoDB ObjectId", 400));
    }
    
    const { billingInfo } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return next(new ApiError("Customer not found", 404));
    }

    customer.billingInfo = { ...customer.billingInfo, ...billingInfo };
    await customer.save();

    SuccessHandler(res, "Billing information updated successfully", customer);
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// Update customer preferences
const updatePreferences = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate id format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError("Invalid customer ID format. Must be a valid MongoDB ObjectId", 400));
    }
    
    const { preferences } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return next(new ApiError("Customer not found", 404));
    }

    customer.preferences = { ...customer.preferences, ...preferences };
    await customer.save();

    SuccessHandler(res, "Preferences updated successfully", customer);
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// Add loyalty points
const addLoyaltyPoints = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate id format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError("Invalid customer ID format. Must be a valid MongoDB ObjectId", 400));
    }
    
    const { points, reason } = req.body;

    if (!points || points <= 0) {
      return next(new ApiError("Invalid points value", 400));
    }

    const customer = await Customer.findById(id);
    if (!customer) {
      return next(new ApiError("Customer not found", 404));
    }

    await customer.addLoyaltyPoints(points);

    SuccessHandler(res, `${points} loyalty points added successfully`, {
      customerId: customer.customerId,
      newLoyaltyPoints: customer.loyaltyPoints,
      reason,
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// Get customer statistics
const getCustomerStats = async (req, res, next) => {
  try {
    const stats = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          activeCustomers: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
          },
          inactiveCustomers: {
            $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] }
          },
          suspendedCustomers: {
            $sum: { $cond: [{ $eq: ["$status", "suspended"] }, 1, 0] }
          },
          totalLoyaltyPoints: { $sum: "$loyaltyPoints" },
          totalOrders: { $sum: "$totalOrders" },
          totalSpent: { $sum: "$totalSpent" },
          averageSpent: { $avg: "$totalSpent" },
        }
      }
    ]);

    const result = stats[0] || {
      totalCustomers: 0,
      activeCustomers: 0,
      inactiveCustomers: 0,
      suspendedCustomers: 0,
      totalLoyaltyPoints: 0,
      totalOrders: 0,
      totalSpent: 0,
      averageSpent: 0,
    };

    SuccessHandler(res, "Customer statistics retrieved successfully", result);
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

// Delete customer
const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate id format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError("Invalid customer ID format. Must be a valid MongoDB ObjectId", 400));
    }

    const customer = await Customer.findById(id);
    if (!customer) {
      return next(new ApiError("Customer not found", 404));
    }

    await Customer.findByIdAndDelete(id);

    SuccessHandler(res, "Customer deleted successfully", null);
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  getCustomerByUserId,
  updateCustomer,
  updateBillingInfo,
  updatePreferences,
  addLoyaltyPoints,
  getCustomerStats,
  deleteCustomer,
}; 