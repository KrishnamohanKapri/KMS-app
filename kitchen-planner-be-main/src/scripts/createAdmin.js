const mongoose = require("mongoose");
const User = require("../models/User/user");
const dotenv = require("dotenv");

dotenv.config({
  path: "./src/config/config.env",
});

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin.email);
      return;
    }

    // Create admin user
    const admin = new User({
      firstName: "Admin",
      lastName: "User",
      email: "admin@kitchen.com",
      password: "admin123",
      role: "admin",
      kitchenNo: "001",
    });

    await admin.save();
    console.log("Admin user created successfully:", admin.email);
    console.log("Login credentials:");
    console.log("Email:", admin.email);
    console.log("Password: admin123");
    console.log("Role:", admin.role);

  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

const createTestStaff = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Create test employee
    const employee = new User({
      firstName: "John",
      lastName: "Employee",
      email: "employee@kitchen.com",
      password: "employee123",
      role: "employee",
      kitchenNo: "001",
    });

    await employee.save();
    console.log("Test employee created:", employee.email);

    // Create test rider
    const rider = new User({
      firstName: "Mike",
      lastName: "Rider",
      email: "rider@kitchen.com",
      password: "rider123",
      role: "rider",
      kitchenNo: "001",
    });

    await rider.save();
    console.log("Test rider created:", rider.email);

  } catch (error) {
    console.error("Error creating test staff:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Run the appropriate function based on command line argument
const action = process.argv[2];

if (action === "staff") {
  createTestStaff();
} else {
  createAdmin();
} 