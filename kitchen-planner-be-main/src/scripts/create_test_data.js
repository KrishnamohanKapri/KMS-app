
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const User = require("../models/User/user");
const Customer = require("../models/User/customer");
const Order = require("../models/User/order");

dotenv.config({
  path: path.join(__dirname, "../config/config.env"),
});

console.log("Connecting to MongoDB...");
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

const createTestData = async () => {
  try {
    console.log("Creating user...");
    // Create a user
    const user = await User.create({
      name: "Test User",
      email: "testuser@example.com",
      password: "password",
      role: "customer",
    });
    console.log("User created:", user);

    console.log("Creating customer...");
    // Create a customer
    const customer = await Customer.create({
      user: user._id,
      billingInfo: {
        firstName: "Test",
        lastName: "User",
        email: "testuser@example.com",
        phone: "1234567890",
        address: {
          street: "123 Test St",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
        },
      },
    });
    console.log("Customer created:", customer);

    console.log("Creating order...");
    // Create an order
    const order = await Order.create({
      user: user._id,
      customer: customer._id,
      meals: ["meal1", "meal2"],
      total: 50,
      subTotal: 45,
      deliveryAddress: {
        street: "123 Test St",
        city: "Test City",
        state: "Test State",
        zipCode: "12345",
      },
      billingInfo: {
        firstName: "Test",
        lastName: "User",
        email: "testuser@example.com",
        phone: "1234567890",
        address: {
          street: "123 Test St",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
        },
      },
    });
    console.log("Order created:", order);
    console.log("ORDER_ID:", order._id);


    console.log("Test data created successfully!");

  } catch (error) {
    console.error("Error creating test data:", error.stack);
  } finally {
    mongoose.connection.close();
  }
};

createTestData();
