const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");

const orderDeliveryAddressMap = new Map();

const updateDeliveryPersonAddressForOrder = async (req, res) => {
  try {

    if (typeof req.body.orderId !== "string")
      throw new Error("OrderId missing in request");

    if (
      !Array.isArray(req.body.location) ||
      req.body.location.length !== 2 ||
      req.body.location.find(elem => typeof elem !== "number")
    ) throw new Error("Location is missing in request, correct format: [lat: number, long: number]");

    const { orderId, location } = req.body;
    // TODO: Verify order exists, user's role is correct, and user is assigned for the delivery of this order
    orderDeliveryAddressMap.set(orderId, location);

    return SuccessHandler(res, "Updated Successfully", { location }, 200);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};


const getDeliveryPersonAddressForOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    // TODO: Verify order exists, user's role is correct, and user is allowed to access the delivery information of this order
    const location = orderDeliveryAddressMap.get(orderId);

    return SuccessHandler(res, "Success", { location }, 200);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  updateDeliveryPersonAddressForOrder,
  getDeliveryPersonAddressForOrder
}
