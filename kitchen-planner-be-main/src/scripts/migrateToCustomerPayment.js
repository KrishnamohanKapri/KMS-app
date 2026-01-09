const mongoose = require("mongoose");
const path = require("path");
const User = require("../models/User/user");
const Order = require("../models/User/order");
const Customer = require("../models/User/customer");
const Payment = require("../models/User/payment");
require("dotenv").config({ path: path.join(__dirname, "../config/config.env") });

const migrateToCustomerPayment = async () => {
  try {
    console.log("Starting migration to Customer and Payment models...");

    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Get all users
    const users = await User.find({ role: "user" });
    console.log(`Found ${users.length} users to migrate`);

    // Create customers for each user
    for (const user of users) {
      console.log(`Processing user: ${user.firstName} ${user.lastName}`);

      // Check if customer already exists
      const existingCustomer = await Customer.findOne({ user: user._id });
      if (existingCustomer) {
        console.log(`Customer already exists for user ${user._id}`);
        continue;
      }

      // Create customer
      const customer = new Customer({
        user: user._id,
        billingInfo: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: "",
          address: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "United States"
          }
        },
        preferences: {
          dietaryRestrictions: [],
          allergies: [],
          preferredPaymentMethod: "card",
          newsletterSubscription: true,
          marketingEmails: true
        }
      });

      await customer.save();
      console.log(`Created customer for user ${user._id}`);
    }

    // Get all orders
    const orders = await Order.find({});
    console.log(`Found ${orders.length} orders to migrate`);

    // Update orders to include customer reference
    for (const order of orders) {
      console.log(`Processing order: ${order.orderId}`);

      // Find customer for this order's user
      const customer = await Customer.findOne({ user: order.user });
      if (!customer) {
        console.log(`No customer found for order ${order.orderId}, skipping...`);
        continue;
      }

      // Update order with customer reference
      order.customer = customer._id;
      
      // Update order fields if they don't exist
      if (!order.tax) order.tax = 0;
      if (!order.deliveryFee) order.deliveryFee = 0;
      if (!order.discount) order.discount = 0;
      
      // Convert subTotal to number if it's a string
      if (typeof order.subTotal === 'string') {
        order.subTotal = parseFloat(order.subTotal) || 0;
      }

      // Add delivery address if not exists
      if (!order.deliveryAddress && order.billingInfo) {
        order.deliveryAddress = {
          street: order.billingInfo.street || "",
          city: order.billingInfo.city || "",
          state: order.billingInfo.state || "",
          zipCode: order.billingInfo.zipCode || "",
          country: order.billingInfo.country || "United States",
          instructions: ""
        };
      }

      await order.save();
      console.log(`Updated order ${order.orderId} with customer reference`);

      // Update customer order statistics
      await customer.updateOrderStats(order.total);
    }

    // Create sample payments for existing orders (optional)
    console.log("Creating sample payments for existing orders...");
    const ordersWithCustomers = await Order.find({ customer: { $exists: true } });
    
    for (const order of ordersWithCustomers) {
      // Check if payment already exists
      const existingPayment = await Payment.findOne({ order: order._id });
      if (existingPayment) {
        console.log(`Payment already exists for order ${order.orderId}`);
        continue;
      }

      // Create sample payment
      const payment = new Payment({
        order: order._id,
        customer: order.customer,
        amount: order.total,
        currency: "USD",
        type: "card",
        method: "credit_card",
        status: order.status === "delivered" ? "completed" : "pending",
        paymentDetails: {
          cardType: "visa",
          last4Digits: "1234",
          cardBrand: "Visa"
        },
        billingAddress: order.deliveryAddress || {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "United States"
        },
        fees: {
          processingFee: 0,
          taxAmount: order.tax || 0,
          discountAmount: order.discount || 0
        }
      });

      await payment.save();
      
      // Update order with payment reference
      order.payment = payment._id;
      await order.save();
      
      console.log(`Created payment for order ${order.orderId}`);
    }

    console.log("Migration completed successfully!");
    
    // Print summary
    const customerCount = await Customer.countDocuments();
    const paymentCount = await Payment.countDocuments();
    const orderCount = await Order.countDocuments();
    
    console.log("\nMigration Summary:");
    console.log(`- Total Customers: ${customerCount}`);
    console.log(`- Total Payments: ${paymentCount}`);
    console.log(`- Total Orders: ${orderCount}`);

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrateToCustomerPayment();
}

module.exports = migrateToCustomerPayment; 