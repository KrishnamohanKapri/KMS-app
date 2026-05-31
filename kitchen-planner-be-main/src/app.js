const express = require("express");
const cors = require("cors");
const ApiError = require("./utils/ApiError");
const app = express();
const router = require("./router");
const loggerMiddleware = require("./middleware/loggerMiddleware");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("../swagger_output.json"); // Generated Swagger file
// const fileUpload = require("express-fileupload"); // Removed - conflicts with multer
const path = require("path");
const { stripeWebhook } = require("./controllers/paymentcontrollerforstripe"); // Import stripeWebhook

// Stripe Webhook endpoint - MUST be before express.json() to receive the raw body
app.post('/webhook/stripe', express.raw({type: 'application/json'}), stripeWebhook);

// Debug middleware
// app.use((req, res, next) => {
//   console.log('Incoming Request:', {
//     method: req.method,
//     url: req.url,
//     headers: req.headers,
//     body: req.body,
//     query: req.query
//   });
//   next();
// });

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin:  ['http://localhost:4200','http://localhost:5000', 'https://kitchen-planner-fe.vercel.app', 'http://127.0.0.1:8080/'],
  credentials: true,
}));
app.options("*", cors());
app.use(loggerMiddleware);
// app.use(fileUpload()); // Removed - conflicts with multer middleware
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Response logging middleware
// app.use((req, res, next) => {
//   // Store original methods
//   const originalSend = res.send;
//   const originalStatus = res.status;
//   const originalJson = res.json;
//   
//   // Ensure critical methods are preserved
//   if (typeof originalStatus === 'function') {
//     res.status = originalStatus;
//   }
//   
//   if (typeof originalJson === 'function') {
//     res.json = originalJson;
//   }
//   
//   // Only override send method for logging
//   res.send = function (data) {
//     console.log('Outgoing Response:', {
//       status: res.statusCode,
//       data: data
//     });
//     return originalSend.apply(res, arguments);
//   };
//   
//   next();
// });

// router index
app.use("/", router);
// api doc
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => {
  res.send("BE-boilerplate v1.1");
});

// Simple test route to verify response object integrity
app.get("/test", (req, res) => {
  console.log('🔍 Testing basic response object');
  console.log('🔧 res type:', typeof res);
  console.log('🔧 res.status type:', typeof res.status);
  console.log('🔧 res.json type:', typeof res.json);
  
  try {
    res.status(200).json({
      success: true,
      message: 'Response object is working',
      resType: typeof res,
      hasStatus: typeof res.status === 'function',
      hasJson: typeof res.json === 'function'
    });
  } catch (error) {
    console.error('❌ Test route error:', error);
    res.send('Error: ' + error.message);
  }
});

// Test route to verify response object integrity
app.get("/test-response", (req, res) => {
  console.log('🔍 Testing response object integrity');
  console.log('🔧 Response object type:', typeof res);
  console.log('🔧 Response object methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(res)));
  console.log('🔧 res.status type:', typeof res.status);
  console.log('🔧 res.json type:', typeof res.json);
  
  try {
    res.status(200).json({
      success: true,
      message: 'Response object is working correctly',
      resType: typeof res,
      hasStatus: typeof res.status === 'function',
      hasJson: typeof res.json === 'function'
    });
  } catch (error) {
    console.error('❌ Error in test route:', error);
    res.send('Response object error: ' + error.message);
  }
});

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(404, "Not found"));
});

// Global error handling middleware
app.use((error, req, res, next) => {
  let err = error;
  
  // If error is not an instance of ApiError, create one
  if (!(err instanceof ApiError)) {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    err = new ApiError(statusCode, message);
  }
  
  // Log the error
  console.error('Error:', {
    statusCode: err.statusCode,
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  // Send error response
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
