

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const User = require("../models/User/user");
const Customer = require("../models/User/customer");
const Order = require("../models/User/order");
const axios = require("axios");

dotenv.config({
  path: path.join(__dirname, "../config/config.env"),
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

const createFullTestData = async () => {
  try {
    // 1. Register a new user
    console.log("Registering new user...");
    const registerResponse = await axios.post("http://localhost:8001/auth/register", {
      firstName: "Payment",
      lastName: "Test",
      email: "paymenttest@example.com",
      password: "password123",
      role: "user",
    });
    console.log("User registration response:", registerResponse.data);
    const userId = registerResponse.data.data._id;

    // 2. Log in to get JWT token
    console.log("Logging in to get JWT token...");
    const loginResponse = await axios.post("http://localhost:8001/auth/login", {
      email: "paymenttest@example.com",
      password: "password123",
    });
    console.log("Login response:", loginResponse.data);
    const token = loginResponse.data.data.token;

    // 3. Create a customer
    console.log("Creating customer...");
    const customerResponse = await axios.post("http://localhost:8001/customer", {
      userId: userId,
      billingInfo: {
        firstName: "Payment",
        lastName: "Test",
        email: "paymenttest@example.com",
        phone: "1234567890",
        address: {
          street: "123 Test St",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
        },
      },
      preferences: {},
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Customer creation response:", customerResponse.data);
    const customerId = customerResponse.data.data._id;

    // 4. Create an order
    console.log("Creating order...");
    const orderResponse = await axios.post("http://localhost:8001/order", {
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
        firstName: "Payment",
        lastName: "Test",
        email: "paymenttest@example.com",
        phone: "1234567890",
        address: {
          street: "123 Test St",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
        },
      },
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Order creation response:", orderResponse.data);
    const orderId = orderResponse.data.data._id;

    console.log("\n--- Test Data Summary ---");
    console.log("User ID:", userId);
    console.log("Customer ID:", customerId);
    console.log("Order ID:", orderId);
    console.log("JWT Token:", token);

  } catch (error) {
    console.error("Error creating full test data:", error.response ? error.response.data : error.message);
  } finally {
    mongoose.connection.close();
  }
};

createFullTestData();
