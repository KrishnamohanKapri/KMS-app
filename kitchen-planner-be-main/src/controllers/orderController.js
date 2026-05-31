const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const sendNotification = require("../utils/sendNotification");
const Meal = require("../models/Meals/meals");
const Order = require("../models/User/order");
const User = require("../models/User/user");
const Customer = require("../models/User/customer");
const Payment = require("../models/User/payment");
const OrderHistoryTracker = require("../utils/orderHistoryTracker");
const MealAllergen = require("../models/Meals/mealAllergen");
const MealIngredient = require("../models/Meals/mealIngredient");
const MealTag = require("../models/Meals/mealTag");
// const Order = require("../models/Orders/order");

const getAllOrders = async (req, res) => {
  // #swagger.tags = ['orders']
  try {
    const searchFilter = req.query.search
      ? {
          $or: [
            { "user.firstName": { $regex: req.query.search, $options: "i" } },
            { "user.lastName": { $regex: req.query.search, $options: "i" } },
            { "user.email": { $regex: req.query.search, $options: "i" } },
            { orderId: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let roleFilter = {};
    
    // Apply role-based filtering
    if (req.user.role === "user") {
      // Regular users can only see their own orders
      roleFilter = { user: req.user._id };
    } else if (req.user.role === "chef") {
      // Chefs can only see orders for meals they are assigned to in meal plans
      const MealPlan = require("../models/Meals/mealPlan");
      
      // Find all meal plans where this chef is assigned
      const assignedMealPlans = await MealPlan.find({
        assignedStaff: req.user._id
      }).select('meals.mealId');
      
      // Extract all meal IDs from assigned meal plans
      const assignedMealIds = assignedMealPlans.flatMap(plan => 
        plan.meals.map(meal => meal.mealId)
      );
      
      if (assignedMealIds.length > 0) {
        // Filter orders that contain meals assigned to this chef
        roleFilter = {
          "meals._id": { $in: assignedMealIds }
        };
      } else {
        // If chef is not assigned to any meal plans, return empty result
        roleFilter = { _id: { $in: [] } };
      }
    }
    // Admin role has no additional filtering (can see all orders)

    const orders = await Order.find({
      ...searchFilter,
      ...roleFilter,
    })
      .populate("user")
      .populate("customer", "customerId billingInfo")
      .populate("payment", "paymentId amount status type method")
      .skip(skip)
      .limit(limit);

    // Populate meal details with ingredient information
    const ordersWithMealDetails = await Promise.all(
      orders.map(async (order) => {
        const populatedOrder = order.toObject();
        if (populatedOrder.meals && populatedOrder.meals.length > 0) {
          const populatedMeals = await Promise.all(
            populatedOrder.meals.map(async (mealItem) => {
              const meal = await Meal.findById(mealItem._id)
                .populate("category")
                .populate("nutritionalInfo")
                .populate("dietaryInfo");
              
              if (!meal) return mealItem;

              // Get meal ingredients with quantities
              const [allergens, ingredients, tags] = await Promise.all([
                MealAllergen.find({ mealId: meal._id }).populate("allergenId"),
                MealIngredient.find({ mealId: meal._id }).populate("ingredientId"),
                MealTag.find({ mealId: meal._id }).populate("tagId")
              ]);

              return {
                ...mealItem,
                mealDetails: {
                  ...meal.toObject(),
                  allergens: allergens.map(ma => ma.allergenId),
                  ingredients: ingredients.map(mi => ({
                    ingredient: mi.ingredientId,
                    quantity: mi.quantity,
                    unit: mi.unit,
                    isOptional: mi.isOptional,
                    cost: mi.cost
                  })),
                  tags: tags.map(mt => mt.tagId)
                }
              };
            })
          );
          populatedOrder.meals = populatedMeals;
        }
        return populatedOrder;
      })
    );
    return SuccessHandler(ordersWithMealDetails, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const getOrder = async (req, res) => {
  // #swagger.tags = ['orders']
  try {
    let order = await Order.findById(req.params.id)
      .populate("user")
      .populate("customer", "customerId billingInfo preferences")
      .populate("payment", "paymentId amount status type method paymentDetails");
    
    if (!order) {
      return ErrorHandler("Order not found", 404, req, res);
    }

    // Apply role-based access control
    if (req.user.role === "user") {
      // Regular users can only see their own orders
      if (order.user._id.toString() !== req.user._id.toString()) {
        return ErrorHandler("Access denied: You can only view your own orders", 403, req, res);
      }
    } else if (req.user.role === "chef") {
      // Chefs can only see orders for meals they are assigned to in meal plans
      const MealPlan = require("../models/Meals/mealPlan");
      
      // Find all meal plans where this chef is assigned
      const assignedMealPlans = await MealPlan.find({
        assignedStaff: req.user._id
      }).select('meals.mealId');
      
      // Extract all meal IDs from assigned meal plans
      const assignedMealIds = assignedMealPlans.flatMap(plan => 
        plan.meals.map(meal => meal.mealId)
      );
      
      // Check if this order contains any meals assigned to this chef
      const orderMealIds = order.meals.map(meal => meal._id);
      const hasAssignedMeals = orderMealIds.some(mealId => 
        assignedMealIds.some(assignedId => assignedId.toString() === mealId.toString())
      );
      
      if (!hasAssignedMeals) {
        return ErrorHandler("Access denied: You can only view orders for meals you are assigned to", 403, req, res);
      }
    }
    // Admin role has no additional filtering (can see all orders)

    // Populate meal details with ingredient information
    const orderWithMealDetails = order.toObject();
    if (order.meals && order.meals.length > 0) {
      const populatedMeals = await Promise.all(
        order.meals.map(async (mealItem) => {
          const meal = await Meal.findById(mealItem._id)
            .populate("category")
            .populate("nutritionalInfo")
            .populate("dietaryInfo");
          
          if (!meal) return mealItem;

          // Get meal ingredients with quantities
          const [allergens, ingredients, tags] = await Promise.all([
            MealAllergen.find({ mealId: meal._id }).populate("allergenId"),
            MealIngredient.find({ mealId: meal._id }).populate("ingredientId"),
            MealTag.find({ mealId: meal._id }).populate("tagId")
          ]);

          return {
            ...mealItem,
            mealDetails: {
              ...meal.toObject(),
              allergens: allergens.map(ma => ma.allergenId),
              ingredients: ingredients.map(mi => ({
                ingredient: mi.ingredientId,
                quantity: mi.quantity,
                unit: mi.unit,
                isOptional: mi.isOptional,
                cost: mi.cost
              })),
              tags: tags.map(mt => mt.tagId)
            }
          };
        })
      );
      orderWithMealDetails.meals = populatedMeals;
    }

    return SuccessHandler(orderWithMealDetails, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const checkout = async (req, res) => {
  // #swagger.tags = ['orders']
  try {
    const { arrayOfMeals } = req.body;
    Promise.all(
      arrayOfMeals.map(async (meal) => {
        const mealDetails = await Meal.findById(meal._id).populate("category");
        if (!mealDetails) {
          // return ErrorHandler("Meal not found", 404, req, res);
          throw new Error("Meal not found");
        }
        let data = { ...mealDetails.toObject(), qty: meal.qty };
        data.totalPrice = data.price * data.qty;
        data.discountedPrice =
          data.discount > 0
            ? data.price - (data.price * data.discount) / 100
            : data.price;
        return data;
      })
    )
      .then((result) => {
        console.log(result);
        return SuccessHandler(
          {
            meals: result,
            total: result.reduce((acc, curr) => acc + curr.totalPrice, 0),
            subTotal: result.reduce(
              (acc, curr) => acc + curr.discountedPrice * curr.qty,
              0
            ),
          },
          200,
          res
        );
      })
      .catch((error) => {
        return ErrorHandler(error.message, 500, req, res);
      });
  } catch (error) {
    console.log(error);
    return ErrorHandler(error.message, 500, req, res);
  }
};
const createOrder = async (req, res) => {
  // #swagger.tags = ['orders']
  try {
    const { 
      meals, 
      total, 
      subTotal, 
      tax = 0,
      deliveryFee = 0,
      discount = 0,
      billingInfo, 
      deliveryAddress,
      specialInstructions 
    } = req.body;

    // Get or create customer for the user
    let customer = await Customer.findOne({ user: req.user._id });
    if (!customer) {
      // Create customer if doesn't exist
      customer = new Customer({
        user: req.user._id,
        billingInfo: {
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          email: req.user.email,
          phone: billingInfo?.phone || "",
          address: billingInfo?.address || {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "United States"
          }
        }
      });
      await customer.save();
    }

    const order = new Order({
      meals,
      total,
      subTotal,
      tax,
      deliveryFee,
      discount,
      user: req.user._id,
      customer: customer._id,
      billingInfo,
      deliveryAddress,
      specialInstructions,
    });
    await order.save();

    // Create initial order history entry
    await OrderHistoryTracker.createInitialEntry(order, req.user._id);

    // Update customer order statistics
    await customer.updateOrderStats(total);

    SuccessHandler(order, 201, res);

    const admins = await User.find({ role: "admin" });
    Promise.all(
      admins.map(async (admin) => {
        await sendNotification(
          admin._id,
          "New Order",
          `You have a new order from ${req.user.firstName} ${req.user.lastName}`,
          "newOrder",
          {
            orderId: order._id,
          }
        );
      })
    );
    Promise.all(
      meals.map(async (meal) => {
        const mealDetails = await Meal.findById(meal._id);
        mealDetails.stock -= meal.qty;
        await mealDetails.save();
      })
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const updateOrderStatus = async (req, res) => {
  // #swagger.tags = ['orders']
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return ErrorHandler("Order not found", 404, req, res);
    }

    // Apply role-based access control
    if (req.user.role === "user") {
      // Regular users cannot update order status
      return ErrorHandler("Access denied: Users cannot update order status", 403, req, res);
    } else if (req.user.role === "chef") {
      // Chefs can only update orders for meals they are assigned to in meal plans
      const MealPlan = require("../models/Meals/mealPlan");
      
      // Find all meal plans where this chef is assigned
      const assignedMealPlans = await MealPlan.find({
        assignedStaff: req.user._id
      }).select('meals.mealId');
      
      // Extract all meal IDs from assigned meal plans
      const assignedMealIds = assignedMealPlans.flatMap(plan => 
        plan.meals.map(meal => meal.mealId)
      );
      
      // Check if this order contains any meals assigned to this chef
      const orderMealIds = order.meals.map(meal => meal._id);
      const hasAssignedMeals = orderMealIds.some(mealId => 
        assignedMealIds.some(assignedId => assignedId.toString() === mealId.toString())
      );
      
      if (!hasAssignedMeals) {
        return ErrorHandler("Access denied: You can only update orders for meals you are assigned to", 403, req, res);
      }
    }
    // Admin role has no additional filtering (can update all orders)
    
    const previousStatus = order.status;
    order.status = req.body.status;
    await order.save();

    // Create order history entry for status change
    await OrderHistoryTracker.updateOrderStatus(
      order, 
      req.body.status, 
      req.user._id, 
      req.body.notes || `Status changed from ${previousStatus} to ${req.body.status}`
    );

    return SuccessHandler(order, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  getAllOrders,
  getOrder,
  checkout,
  createOrder,
  updateOrderStatus,
};
