const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const path = require("path");

// Ensure environment variables are loaded (backup)
if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  dotenv.config({ path: path.join(__dirname, "../config/config.env") });
}

const sendMail = async (email, subject, text, html = null) => {
  try {
    // Validate environment variables
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      throw new Error('Gmail credentials not configured. Please check GMAIL_USER and GMAIL_APP_PASSWORD in config.env');
    }

    // Create Gmail SMTP transport with better configuration
    const transport = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify connection configuration
    await transport.verify();
    console.log('✅ SMTP connection verified successfully');

    // Prepare email content
    const mailOptions = {
      from: `"Kitchen Planner" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: subject,
      text: text,
    };

    // Add HTML content if provided
    if (html) {
      mailOptions.html = html;
    }

    // Send email
    const result = await transport.sendMail(mailOptions);

    console.log('✅ Email sent successfully:', result.messageId);
    return result;
    
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    
    // Provide more specific error messages
    if (error.code === 'EAUTH') {
      throw new Error('Gmail authentication failed. Please check your credentials and ensure 2FA is enabled with an app password.');
    } else if (error.code === 'ECONNECTION') {
      throw new Error('Failed to connect to Gmail SMTP server. Please check your internet connection.');
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('Gmail SMTP connection timed out. Please try again.');
    }
    
    throw error;
  }
};

// Specialized function for password reset emails
const sendPasswordResetEmail = async (email, firstName, resetToken, resetUrl) => {
  const subject = 'Password Reset Request - Kitchen Planner';
  
  const text = `Hello ${firstName},

You requested a password reset for your Kitchen Planner account.

Your password reset token is: ${resetToken}

Reset your password at: ${resetUrl}

This token will expire in 10 minutes.

If you didn't request this, please ignore this email.

Best regards,
Kitchen Planner Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #333; margin: 0;">Kitchen Planner</h2>
        <p style="color: #666; margin: 5px 0;">Password Reset Request</p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
        <p style="margin: 0 0 15px 0; color: #333;">Hello <strong>${firstName}</strong>,</p>
        <p style="margin: 0 0 15px 0; color: #333;">You requested a password reset for your Kitchen Planner account.</p>
        
        <div style="background-color: #fff; padding: 15px; border: 1px solid #dee2e6; border-radius: 4px; margin: 15px 0;">
          <p style="margin: 0; color: #666; font-size: 14px;">Your password reset token:</p>
          <p style="margin: 5px 0; font-family: monospace; font-size: 16px; color: #333; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">${resetToken}</p>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Reset Password</a>
        </div>
        
        <p style="margin: 15px 0; color: #dc3545; font-size: 14px;"><strong>⚠️ This token will expire in 10 minutes.</strong></p>
        
        <p style="margin: 15px 0; color: #666; font-size: 14px;">If you didn't request this password reset, please ignore this email.</p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
        <p style="margin: 0; color: #666; font-size: 14px;">Best regards,<br><strong>Kitchen Planner Team</strong></p>
      </div>
    </div>
  `;

  return await sendMail(email, subject, text, html);
};


const sendOrderInvoiceEmail = async (order, invoiceId, orderId) => {
  const { billingInfo, deliveryAddress, meals, total, tax, subTotal, deliveryFee, discount, specialInstructions } = order;

  const subject = `Order #${orderId} - Kitchen Management System`;

  const paymentUrl = `https://kitchen-planner-fe.vercel.app/checkout/payment/${invoiceId}`;

  const text = `Hello ${billingInfo.firstName},

Thank you for your order with Kitchen Planner.

Order ID: ${orderId}
Order Total: $${total.toFixed(2)}

You can complete your payment securely at: ${paymentUrl}

Best regards,
Kitchen Management System
  `;

  const mealsHtml = meals.map(
    (meal) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px; color: #333;">${meal.name || "Meal"}</td>
        <td style="padding: 12px; text-align:center; color:#555;">${meal.qty}</td>
      </tr>
    `
  ).join("");

  let totalsHtml = `
    <tr><td style="padding: 8px;">Subtotal</td><td style="padding: 8px; text-align:right;">€${subTotal.toFixed(2)}</td></tr>
    <tr><td style="padding: 8px;">Tax</td><td style="padding: 8px; text-align:right;">€${tax.toFixed(2)}</td></tr>
  `;
  if (deliveryFee && deliveryFee > 0) {
    totalsHtml += `<tr><td style="padding: 8px;">Delivery Fee</td><td style="padding: 8px; text-align:right;">€${deliveryFee.toFixed(2)}</td></tr>`;
  }
  if (discount && discount > 0) {
    totalsHtml += `<tr><td style="padding: 8px;">Discount</td><td style="padding: 8px; text-align:right; color:#28a745;">- €${discount.toFixed(2)}</td></tr>`;
  }
  totalsHtml += `<tr style="font-size:16px; font-weight:bold;"><td style="padding: 8px; border-top: 2px solid #333;">Total</td><td style="padding: 8px; text-align:right; border-top: 2px solid #333;">€${total.toFixed(2)}</td></tr>`;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 750px; margin: 0 auto; background:#fff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow:hidden;">
      
      <div style="background: #28a745; padding: 25px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px;">Kitchen Management System</h1>
        <p style="margin: 5px 0 0; font-size: 16px;">Order #${orderId}</p>
      </div>

      <div style="padding: 25px;">
        <p style="font-size: 16px; color:#333;">Hello <strong>${billingInfo.firstName || "Customer"}</strong>,</p>
        <p style="font-size: 15px; color:#555;">Thanks for your order! Here are your order details:</p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f7f7f7; text-align: left;">
              <th style="padding: 12px;">Meal</th>
              <th style="padding: 12px; text-align:center;">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${mealsHtml}
          </tbody>
        </table>

        <div style="background:#f9f9f9; border-radius: 8px; padding: 15px; margin-top: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            ${totalsHtml}
          </table>
        </div>

        <div style="margin-top: 25px;">
          <h3 style="color:#333; margin-bottom: 8px;">Billing Information</h3>
          <p style="margin:0; font-size: 14px; color:#555;">
            ${billingInfo.firstName || ""} ${billingInfo.lastName || ""}<br/>
            ${billingInfo.email || ""}<br/>
            ${billingInfo.phone || ""}<br/>
            ${billingInfo.address?.street || ""}, ${billingInfo.address?.city || ""}, ${billingInfo.address?.state || ""} ${billingInfo.address?.zipCode || ""}, ${billingInfo.address?.country || ""}
          </p>

          <h3 style="color:#333; margin:15px 0 8px;">Delivery Address</h3>
          <p style="margin:0; font-size: 14px; color:#555;">
            ${deliveryAddress?.street || ""}, ${deliveryAddress?.city || ""}, ${deliveryAddress?.state || ""} ${deliveryAddress?.zipCode || ""}, ${deliveryAddress?.country || ""}
          </p>

          ${specialInstructions ? `<p style="margin:15px 0 0; font-size: 14px; color:#555;"><strong>Special Instructions:</strong> ${specialInstructions}</p>` : ""}
        </div>

        <div style="text-align: center; margin: 40px 0 20px;">
          <a href="${paymentUrl}" style="background:#28a745; color:white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight:bold; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
            💳 Pay Now
          </a>
        </div>

        <p style="font-size: 13px; color:#888; text-align: center;">If you’ve already made the payment, you can ignore this message.</p>
      </div>

      <div style="background:#f1f1f1; text-align:center; padding:15px; font-size: 13px; color:#777;">
        <p style="margin:0;">Best regards,<br/><strong>Kitchen Management System</strong></p>
      </div>
    </div>
  `;

  return await sendMail(billingInfo.email, subject, text, html);
};

const sendPaymentConfirmationEmail = async (order) => {
  const { billingInfo, total } = order;

  const subject = `Payment Confirmation - Order #${order.orderId} - Kitchen Planner`;

  const text = `Hello ${billingInfo.firstName},

We’ve received your payment for Order #${order.orderId}.

Amount Paid: €${total.toFixed(2)}

Thank you for trusting Kitchen Management System.

Best regards,
Kitchen Management System
  `;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 700px; margin: 0 auto; background:#fff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow:hidden;">
      
      <div style="background: #28a745; padding: 25px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px;">✅ Payment Successful</h1>
        <p style="margin: 5px 0 0; font-size: 16px;">Order #${order.orderId}</p>
      </div>

      <div style="padding: 25px;">
        <p style="font-size: 16px; color:#333;">Hello <strong>${billingInfo.firstName || "Customer"}</strong>,</p>
        <p style="font-size: 15px; color:#555;">We’re happy to let you know that your payment has been received successfully.</p>

        <div style="background:#f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="margin:0; font-size: 18px; color:#333;"><strong>Amount Paid:</strong> €${total.toFixed(2)}</p>
        </div>

        <p style="font-size: 14px; color:#666;">We will notify you once your order is prepared and on the way.</p>
      </div>

      <div style="background:#f1f1f1; text-align:center; padding:15px; font-size: 13px; color:#777;">
        <p style="margin:0;">Thank you for choosing <strong>Kitchen Management System</strong>!</p>
      </div>
    </div>
  `;

  return await sendMail(billingInfo.email, subject, text, html);
};

const sendOrderDeliveredEmail = async (order) => {
  const { billingInfo } = order;

  const subject = `Order Delivered - Order #${order.orderId} - Kitchen Planner`;

  const text = `Hello ${billingInfo.firstName},

Your order (Order #${order.orderId}) has been delivered successfully.

We hope you enjoy your meal! 🍴

Best regards,
Kitchen Management System
  `;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 700px; margin: 0 auto; background:#fff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow:hidden;">
      
      <div style="background: #28a745; padding: 25px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px;">🚚 Order Delivered</h1>
        <p style="margin: 5px 0 0; font-size: 16px;">Order #${order.orderId}</p>
      </div>

      <div style="padding: 25px; text-align: center;">
        <p style="font-size: 16px; color:#333;">Hello <strong>${billingInfo.firstName || "Customer"}</strong>,</p>
        <p style="font-size: 15px; color:#555;">We’re delighted to let you know that your order has been delivered successfully.</p>

        <div style="margin: 25px 0;">
          <img src="https://img.icons8.com/color/96/000000/delivery.png" alt="Delivered" style="max-width: 100px;"/>
        </div>

        <p style="font-size: 15px; color:#555;">We hope you enjoy your meal and look forward to serving you again soon! 🍴</p>

        <div style="margin: 30px 0;">
          <a href="https://kitchen-planner-fe.vercel.app" style="background:#28a745; color:white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: bold;">Order Again</a>
        </div>
      </div>

      <div style="background:#f1f1f1; text-align:center; padding:15px; font-size: 13px; color:#777;">
        <p style="margin:0;">Thank you for being part of <strong>Kitchen Management System</strong>!</p>
      </div>
    </div>
  `;

  return await sendMail(billingInfo.email, subject, text, html);
};



module.exports = { sendMail, sendPasswordResetEmail, sendOrderInvoiceEmail, sendPaymentConfirmationEmail,sendOrderDeliveredEmail };
