import Booking from "../bookings/booking.model.js";
import razorpay from "../../../config/razorpay.js";
import { getOwnerId } from "../../vehicles/vehicle.service.js";

export const createPaymentOrderService = async (bookingNumber) => {
  const booking = await Booking.findOne({
    bookingNumber,
    isDeleted: false,
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.status !== "approved") {
    throw new Error("Booking must be approved before payment");
  }

  if (booking.payment?.status === "paid") {
    throw new Error("Booking is already paid");
  }

  const amount =
    booking.pricePaidByCustomer + (booking.securityDeposit?.amount || 0);

  const order = await razorpay.orders.create({
    amount: amount * 100, // Razorpay uses paise
    currency: "INR",
    receipt: booking.bookingNumber,

    notes: {
      bookingNumber: booking.bookingNumber,
      vehicleId: booking.vehicle.toString(),
      userId: booking.user.toString(),
      ownerId: getOwnerId(booking.vehicle),
    },
  });

  return {
    bookingNumber: booking.bookingNumber,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    key: process.env.RAZORPAY_KEY_ID,
  };
};


// online payment handler
export const handleOnlinePaymentSuccessService = async ({
  bookingNumber,
  paymentId,
  orderId,
  method,
  securityDepositTransactionId,
  securityDepositMethod,
  userId,
}) => {
  const booking = await booking.findOne({
    bookingNumber,
    isDeleted: false,
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  // idempotency (very important)
  if (booking.payment?.status === "paid") {
    return booking;
  }

  if (booking.status !== "approved") {
    throw new Error("Booking must be approved first");
  }

  // PAYMENT UPDATE
  booking.payment.paymentId = paymentId;
  booking.payment.orderId = orderId;
  booking.payment.method = method;
  booking.payment.status = "paid";
  booking.payment.paidAt = new Date();

  // SECURITY DEPOSIT
  if (booking.securityDeposit?.amount > 0) {
    booking.securityDeposit.status = "held";
    booking.securityDeposit.collectedAt = new Date();
    booking.securityDeposit.paymentMethod = securityDepositMethod || "online";
    booking.securityDeposit.transactionId =
      securityDepositTransactionId || null;
  }

  // PICKUP OTP GENERATION
  booking.pickupOTP = Math.floor(10000 + Math.random() * 90000).toString();

  // CONFIRM BOOKING
  booking.status = "confirmed";
  booking.confirmedAt = new Date();
  booking.confirmedBy = userId || "system";

  await booking.save();

  return booking;
};


// Cash collect manually and confirm booking
export const collectCashAndConfirmBookingService = async (
  bookingNumber,
  user,
) => {
  const booking = await Booking.findOne({
    bookingNumber,
    isDeleted: false,
  }).populate("vehicle", "owner");

  if (!booking) {
    throw new Error("Booking not found");
  }

  if(booking.status === "expired") {
    throw new Error("Booking expired");
  }

  if (booking.status === "confirmed") {
    throw new Error("Booking already confirmed");
  }

  if (booking.status !== "approved") {
    throw new Error("Booking must be approved first");
  }

  if (!booking.securityDeposit?.amount) {
    throw new Error("Security deposit not configured");
  }

  const ownerId = getOwnerId(booking.vehicle);

  if (!canManageResource(ownerId, user)) {
    throw new Error("Not allowed");
  }

  booking.payment.status = "paid";
  booking.payment.method = "cash";
  booking.payment.paidAt = new Date();

  booking.securityDeposit.status = "held";
  booking.securityDeposit.collectedAt = new Date();
  booking.securityDeposit.paymentMethod = "cash";

  booking.status = "confirmed";
  booking.confirmedAt = new Date();
  booking.confirmedBy = user._id;

  booking.pickupOTP = Math.floor(10000 + Math.random() * 90000).toString();

  booking.pickupOTPVerified = false;

  await booking.save();

  return {
    success: true,
    message: "Cash collected and booking confirmed",
    bookingNumber: booking.bookingNumber,
    status: booking.status,
  };
};