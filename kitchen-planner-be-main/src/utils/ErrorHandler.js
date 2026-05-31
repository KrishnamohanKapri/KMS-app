const logger = require("../functions/logger");

const ErrorHandler = (message, statusCode, req, res) => {
  console.log('🔍 ErrorHandler called with:');
  console.log('📝 Message:', message);
  console.log('🔢 Status Code:', statusCode);
  console.log('📨 Request object type:', typeof req);
  console.log('🔧 Response object type:', typeof res);
  
  // Validate parameters
  if (!message) {
    console.error('❌ ErrorHandler: Message is required');
    throw new Error('ErrorHandler: Message is required');
  }
  
  if (!statusCode || typeof statusCode !== 'number') {
    console.error('❌ ErrorHandler: Valid status code is required');
    throw new Error('ErrorHandler: Valid status code is required');
  }
  
  if (!req) {
    console.error('❌ ErrorHandler: Request object is required');
    throw new Error('ErrorHandler: Request object is required');
  }
  
  if (!res) {
    console.error('❌ ErrorHandler: Response object is required');
    throw new Error('ErrorHandler: Response object is required');
  }
  
  // Log the error
  try {
    logger.error({
      method: req?.method || 'UNKNOWN',
      url: req?.url || 'UNKNOWN',
      date: new Date(),
      message: message,
    });
  } catch (logError) {
    console.error('Failed to log error:', logError);
  }
  
  // Check if response object is valid
  if (typeof res.status !== 'function') {
    console.error('❌ Response object missing status method');
    console.error('❌ Response object:', res);
    console.error('❌ Response object prototype:', Object.getPrototypeOf(res));
    
    // Try to create a basic error response if possible
    if (typeof res.json === 'function') {
      try {
        return res.json({
          success: false,
          message: message,
          error: 'Response object corrupted'
        });
      } catch (jsonError) {
        console.error('Failed to send JSON response:', jsonError);
        throw new Error('Cannot send response: response object corrupted');
      }
    } else {
      throw new Error('Response object is corrupted and cannot send response');
    }
  }
  
  // If we get here, the response object is valid
  try {
    return res.status(statusCode).json({
      success: false,
      message: message,
    });
  } catch (responseError) {
    console.error('Failed to send response:', responseError);
    throw new Error('Failed to send response: ' + responseError.message);
  }
};

module.exports = ErrorHandler;
