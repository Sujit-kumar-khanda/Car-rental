import crypto from "crypto";
import { handleOnlinePaymentSuccessService } from "./payment.service.js";

export const razorpayWebhookController = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const signature = req.headers["x-razorpay-signature"];

    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    // verify webhook authenticity
    if (signature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    const event = req.body.event;

    // only handle successful payment
    if (event === "payment.captured") {
      const payment = req.body.payload.payment.entity;

      await handleOnlinePaymentSuccessService({
        bookingNumber: payment.notes.bookingNumber,
        paymentId: payment.id,
        orderId: payment.order_id,
        method: payment.method,
        securityDepositTransactionId: null,
        securityDepositMethod: "online",
        userId: null, // system triggered
      });
    }

    return res.status(200).json({
      success: true,
      message: "Webhook processed",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
