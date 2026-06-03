import * as paymentService from "./payment.service.js";

// CREATE PAYMENT ORDER
export const createPaymentOrder = async (req, res) => {
  try {
    const result = await paymentService.createPaymentOrderService(
      req.params.bookingNumber,
    );

    return res.status(200).json({
      success: true,
      message: "Payment order created successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create payment order",
    });
  }
};

//cash payment handler
export const collectCashAndConfirmBooking = async (req, res) => {
  try {
    const { bookingNumber } = req.params;
    const { amount, securityDepositAmount } = req.body;

    const result = await paymentService.collectCashAndConfirmBookingService(
      bookingNumber,
      amount,
      securityDepositAmount,
    );

    return res.status(200).json({
      success: true,
      message: "Cash collected and booking confirmed successfully",
      data: result,
    });
  } catch (error) {
    const status =
      error.message === "Booking not found"
        ? 404
        : error.message.includes("Not allowed")
          ? 403
          : 400;
    return res.status(status).json({
      success: false,
      message: error.message || "Failed to collect cash and confirm booking",
    });
  }
};

