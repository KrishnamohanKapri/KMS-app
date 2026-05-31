const SuccessHandler = (res, message, data, statusCode = 200) => {
  // Handle both parameter orders for backward compatibility
  let actualRes, actualMessage, actualData, actualStatusCode;
  
  // Check if first parameter is a response object
  if (res && typeof res.status === 'function') {
    // Correct order: (res, message, data, statusCode)
    actualRes = res;
    actualMessage = message;
    actualData = data;
    actualStatusCode = statusCode;
  } else if (res && typeof res === 'object' && typeof message === 'number') {
    // Incorrect order: (data, statusCode, res)
    actualRes = data;
    actualMessage = 'Success';
    actualData = res;
    actualStatusCode = message;
    
    console.warn('⚠️ SuccessHandler called with incorrect parameter order. Please fix: SuccessHandler(res, message, data, statusCode)');
  } else {
    // Fallback for other cases
    actualRes = res;
    actualMessage = message || 'Success';
    actualData = data;
    actualStatusCode = statusCode || 200;
  }
  
  // Check if response object is valid
  if (!actualRes) {
    console.error('❌ SuccessHandler: Response object is null or undefined');
    throw new Error('Response object is null or undefined');
  }
  
  if (typeof actualRes.status !== 'function') {
    console.error('❌ SuccessHandler: Response object missing status method');
    console.error('❌ Response object:', actualRes);
    
    // Try to create a basic response if possible
    if (typeof actualRes.json === 'function') {
      try {
        return actualRes.json({
          success: true,
          message: actualMessage,
          data: actualData,
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
  
  try {
    return actualRes.status(actualStatusCode).json({
      success: true,
      message: actualMessage,
      data: actualData,
    });
  } catch (responseError) {
    console.error('Failed to send success response:', responseError);
    throw new Error('Failed to send response: ' + responseError.message);
  }
};

module.exports = SuccessHandler;