const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const Order = require("../models/User/order");
const User = require("../models/User/user");
const Customer = require("../models/User/customer");

const dashboardStats = async (req, res) => {
  // #swagger.tags = ['Dashboard']
  try {
    const totalEarnings = await Order.aggregate([
  { $match: { status: "delivered" } },
  { $group: { _id: null, totalEarnings: { $sum: { $toDouble: "$subTotal" } } } },
]);
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    const totalChefs = await User.countDocuments({
      role: "chef",
      isActive: true,
    });

    return SuccessHandler(
      res,
      "Dashboard stats retrieved successfully",
      {
        totalEarnings: totalEarnings[0]?.totalEarnings || 0,
        totalOrders,
        totalCustomers,
        totalChefs,
      },
      200
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const incomeStats = async (req, res) => {
  // #swagger.tags = ['Dashboard']
  try {
    const year = req.query.year
      ? {
        createdAt: {
          $gte: new Date(new Date(req.query.year).getFullYear(), 0, 1),
          $lt: new Date(new Date(req.query.year).getFullYear() + 1, 0, 1),
        },
      }
      : {
        createdAt: {
          $gte: new Date(new Date().getFullYear(), 0, 1),
          $lt: new Date(new Date().getFullYear() + 1, 0, 1),
        },
      };

    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];

    const totalOrdersByMonth = await Order.aggregate([
      { $match: { status: "delivered", ...year } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$subTotal" },
        },
      },
    ]);

    const orders = months.map((month, index) => {
      const order = totalOrdersByMonth.find((o) => o._id === index + 1);
      return { month, total: order?.total || 0 };
    });

    return SuccessHandler(res, "Income stats retrieved successfully", orders, 200);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};


const orderStats = async (req, res) => {
  // #swagger.tags = ['Dashboard']
  try {
    const year = req.query.year
      ? {
        createdAt: {
          $gte: new Date(new Date(req.query.year).getFullYear(), 0, 1),
          $lt: new Date(new Date(req.query.year).getFullYear(), 11, 31),
        },
      }
      : {
        createdAt: {
          $gte: new Date(new Date().getFullYear(), 0, 1),
          $lt: new Date(new Date().getFullYear(), 11, 31),
        },
      };
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const totalOrdersByMonth = await Order.aggregate([
      { $match: { ...year } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: 1 },
        },
      },
    ]);

    const orders = months.map((month, index) => {
      const order = totalOrdersByMonth.find(
        (order) => order._id === months.indexOf(month) + 1
      );
      return { month, total: order?.total || 0 };
    });

    return SuccessHandler(
      res,
      "Order stats retrieved successfully",
      orders,
      200
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  dashboardStats,
  incomeStats,
  orderStats,
};
