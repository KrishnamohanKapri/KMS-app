const stripe = require('stripe');
const fs = require('fs');

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
  console.error("Error: STRIPE_SECRET_KEY is not defined in environment variables.");
  // You might want to throw an error here or handle it gracefully
}

if (!stripeWebhookSecret) {
  console.error("Error: STRIPE_WEBHOOK_SECRET is not defined in environment variables. This is required for webhook security.");
}

const stripeInstance = stripe(stripeSecretKey);

const Payment = require('../models/User/payment');
const Order = require('../models/User/order');
const Customer = require('../models/User/customer');
const ApiError = require('../utils/ApiError');
const mongoose = require("mongoose");
const SuccessHandler = require('../utils/SuccessHandler');

const createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId, currency = 'USD' } = req.body;

    // Validate the provided currency against the Payment model's enum
    const allowedCurrencies = Payment.schema.path('currency').enumValues;
    const upperCaseCurrency = currency.toUpperCase();

    if (!allowedCurrencies.includes(upperCaseCurrency)) {
      return next(new ApiError(`Invalid currency '${currency}'. Allowed currencies are: ${allowedCurrencies.join(', ')}`, 400));
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return next(new ApiError('Order not found', 404));
    }

    const customer = await Customer.findById(order.customer);
    if (!customer) {
      return next(new ApiError('Customer not found', 404));
    }

    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: order.total * 100, // Amount in cents
      currency: upperCaseCurrency.toLowerCase(), // Stripe requires lowercase currency codes
      automatic_payment_methods: { enabled: true },
      metadata: { orderId: order._id.toString() },
    });

    const payment = new Payment({
      order: orderId,
      customer: order.customer,
      amount: order.total,
      currency: upperCaseCurrency,
      type: 'stripe',
      method: 'stripe_wallet',
      status: 'pending', // Initial status when created
      paymentDetails: {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
      },
    });

    await payment.save();

    SuccessHandler(
      res,
      "Payment Intent created successfully",
      {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        paymentId: payment._id, // Internal DB payment ID
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      },
      201
    );
  } catch (error) {
    // fs.appendFileSync('errorlog.txt', `[${new Date().toISOString()}] Stripe Payment Intent creation failed: ${error.message}\n${error.stack}\n\n`);
    next(new ApiError(500, error.message));
  }
};

const stripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
  } catch (err) {
    // fs.appendFileSync('errorlog.txt', `[${new Date().toISOString()}] Stripe Webhook Error: ${err.message}\n${err.stack}\n\n`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Use a try-catch block to handle potential errors during event processing.
  // This prevents the server from crashing on a single failed webhook.
  try {
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntentSucceeded = event.data.object;
        await handlePaymentIntentStatusUpdate(paymentIntentSucceeded, 'completed');
        break;
      case 'payment_intent.payment_failed':
        const paymentIntentFailed = event.data.object;
        await handlePaymentIntentStatusUpdate(paymentIntentFailed, 'failed');
        break;
      case 'payment_intent.canceled':
        const paymentIntentCanceled = event.data.object;
        await handlePaymentIntentStatusUpdate(paymentIntentCanceled, 'cancelled');
        break;
      case 'payment_intent.processing':
        const paymentIntentProcessing = event.data.object;
        await handlePaymentIntentStatusUpdate(paymentIntentProcessing, 'processing');
        break;
      case 'payment_intent.requires_action':
        const paymentIntentRequiresAction = event.data.object;
        await handlePaymentIntentStatusUpdate(paymentIntentRequiresAction, 'pending');
        break;
      case 'charge.refunded':
        const chargeRefunded = event.data.object;
        await handleChargeRefunded(chargeRefunded);
        break;
      default:
        console.log(`✅ Unhandled webhook event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`❌ Error processing webhook event ${event.id} (${event.type}):`, error);
    // Return a 500 to indicate a server-side problem. Stripe will attempt to retry.
    return res.status(500).json({ error: 'Webhook handler failed. Please check logs.' });
  }

  res.status(200).json({ received: true });
};

// --- Consolidated Helper function to update payment and order status ---

async function handlePaymentIntentStatusUpdate(paymentIntent, newPaymentStatus) {
  const payment = await Payment.findOne({ "paymentDetails.paymentIntentId": paymentIntent.id });

  if (payment) {
    payment.status = newPaymentStatus;

    // If the payment succeeded, fetch the charge to get the transaction details.
    // This is more reliable than depending on the 'charges' array in the webhook payload.
    if (newPaymentStatus === 'completed' && paymentIntent.latest_charge) {
      try {
        const charge = await stripeInstance.charges.retrieve(paymentIntent.latest_charge);

        payment.paymentDetails.transactionId = charge.id;
        payment.paymentDetails.receiptUrl = charge.receipt_url;

        // Extract and save card details if available
        if (charge.payment_method_details && charge.payment_method_details.card) {
          payment.paymentDetails.cardType = charge.payment_method_details.card.brand; // e.g., 'visa', 'mastercard'
          payment.paymentDetails.cardBrand = charge.payment_method_details.card.funding; // e.g., 'credit', 'debit'
          payment.paymentDetails.last4Digits = charge.payment_method_details.card.last4;
        }
      } catch (error) {
        console.error(`Failed to retrieve charge ${paymentIntent.latest_charge}:`, error.message);
        // Continue saving the payment status even if charge retrieval fails.
      }
    }
    await payment.save();

    const order = await Order.findById(payment.order);
    if (order) {
      // Map payment status to order status as per your application's logic
      let newOrderStatus = order.status; // Keep current status by default

      if (newPaymentStatus === 'completed') {
        newOrderStatus = 'confirmed'; // Or 'paid', 'fulfilled'
      } else if (newPaymentStatus === 'failed') {
        newOrderStatus = 'cancelled'; // Or 'payment_failed'
      } else if (newPaymentStatus === 'cancelled') {
        newOrderStatus = 'cancelled'; // Or 'order_cancelled'
      } else if (newPaymentStatus === 'processing') {
        newOrderStatus = 'pending'; // Or 'payment_processing'
      }
      // For 'pending' (which includes 'requires_action'), order status might remain 'pending' or 'awaiting_payment'

      if (order.status !== newOrderStatus) { // Only save if status actually changes
        order.status = newOrderStatus;
        await order.save();
        await sendPaymentConfirmationEmail(
          order
        );
      }
    }
  }
}

async function handleChargeRefunded(charge) {
  const payment = await Payment.findOne({ "paymentDetails.transactionId": charge.id });

  if (payment) {
    // Check if it's a full or partial refund
    if (charge.amount_refunded === charge.amount) {
      payment.status = 'refunded';
    } else {
      // If your enum doesn't have 'partially_refunded', you might just keep 'refunded' or 'processing'
      payment.status = 'refunded'; // Assuming 'refunded' covers partial for now
    }
    await payment.save();

    const order = await Order.findById(payment.order);
    if (order) {
      let newOrderStatus = order.status;
      if (payment.status === 'refunded') {
        newOrderStatus = 'refunded'; // Map refunded payment to refunded order status
      }
      if (order.status !== newOrderStatus) {
        order.status = newOrderStatus;
        await order.save();
      }
    }
  }
}

const cancelPaymentIntent = async (req, res, next) => {
  try {
    const { paymentId } = req.params; // Using our internal payment ID

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return next(new ApiError("Invalid payment ID format.", 400));
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return next(new ApiError('Payment record not found in local DB', 404));
    }

    if (payment.type !== 'stripe') {
      return next(new ApiError('This action is only for Stripe payments.', 400));
    }

    const paymentIntentId = payment.paymentDetails?.paymentIntentId;
    if (!paymentIntentId) {
      return next(new ApiError('Stripe Payment Intent ID not found for this payment', 404));
    }

    // You can only cancel a PaymentIntent if it's not already succeeded or canceled.
    const intent = await stripeInstance.paymentIntents.retrieve(paymentIntentId);
    if (intent.status === 'succeeded' || intent.status === 'canceled') {
      return next(new ApiError(`Payment Intent cannot be canceled. Status: ${intent.status}`, 400));
    }

    const canceledIntent = await stripeInstance.paymentIntents.cancel(paymentIntentId);

    // Update local payment status to 'cancelled'
    payment.status = 'cancelled';
    await payment.save();

    // Also update the corresponding order's status to 'cancelled'
    const order = await Order.findById(payment.order);
    if (order) {
      order.status = 'cancelled';
      await order.save();
    }

    SuccessHandler(
      res,
      "Payment Intent cancelled successfully. Local payment and order status updated.",
      {
        paymentIntentId: canceledIntent.id,
        status: canceledIntent.status,
        localPaymentStatus: payment.status
      },
      200
    );

  } catch (error) {
    // Handle Stripe-specific errors
    if (error.type === 'StripeInvalidRequestError') {
      return next(new ApiError(400, error.message));
    }
    next(new ApiError(500, error.message));
  }
};

const refundPaymentIntent = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body; // `amount` is optional for partial refunds

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return next(new ApiError(400, "Invalid payment ID format."));
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return next(new ApiError(404, 'Payment record not found in local DB'));
    }

    if (payment.type !== 'stripe') {
      return next(new ApiError(400, 'This action is only for Stripe payments.'));
    }

    if (payment.status !== 'completed') {
      return next(new ApiError(400, `Cannot refund a payment with status '${payment.status}'. Only 'completed' payments can be refunded.`));
    }

    const paymentIntentId = payment.paymentDetails?.paymentIntentId;
    if (!paymentIntentId) {
      return next(new ApiError(404, 'Stripe Payment Intent ID not found for this payment'));
    }

    const refundOptions = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      const remainingAmount = payment.amount - (payment.refundInfo.refundedAmount || 0);
      if (amount <= 0 || amount > remainingAmount) {
        return next(new ApiError(400, `Invalid refund amount. Amount must be between 0 and ${remainingAmount}.`));
      }
      refundOptions.amount = Math.round(amount * 100); // Stripe expects amount in cents
    }

    if (reason) {
      const allowedReasons = ['duplicate', 'fraudulent', 'requested_by_customer'];
      if (allowedReasons.includes(reason)) {
        // If the reason is a valid Stripe reason, use it.
        refundOptions.reason = reason;
      } else {
        // Otherwise, treat it as a custom note and add it to metadata.
        refundOptions.metadata = { custom_reason: reason };
      }
    }

    const refund = await stripeInstance.refunds.create(refundOptions);

    // Update local database immediately
    await payment.processRefund(refund.amount / 100, reason || 'Refund processed via API');
    payment.refundInfo.refundTransactionId = refund.id; // Store the latest Stripe refund ID
    await payment.save();

    // If fully refunded, update the order status as well
    if (payment.status === 'refunded') {
      await Order.updateOne({ _id: payment.order }, { $set: { status: 'refunded' } });
    }

    SuccessHandler(res, "Refund processed successfully.", {
      refundId: refund.id,
      paymentIntentId: refund.payment_intent,
      amountRefunded: refund.amount / 100,
      status: refund.status,
      localPaymentStatus: payment.status,
      totalRefundedOnPayment: payment.refundInfo.refundedAmount
    }, 200);

  } catch (error) {
    if (error.type) { // Stripe errors have a 'type' property
      return next(new ApiError(400, error.message));
    }
    next(new ApiError(500, error.message));
  }
};

module.exports = {
  createPaymentIntent,
  stripeWebhook,
  cancelPaymentIntent,
  refundPaymentIntent,
};