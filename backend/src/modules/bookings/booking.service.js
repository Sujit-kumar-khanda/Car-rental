import Booking from "./booking.model.js";
import Vehicle from "../models/vechileModel.js";
import User from "../models/userModel.js";
import { BOOKING_STATUS, BOOKING_PRICING } from "../booking.constants.js";
import { calculateBookingPrice } from "./services/pricing.service.js";
import { canManageResource } from "../../utils/permission.js";

// ================= SAFE OWNER HELPER =================
const getOwnerId = (vehicle) => {
  return vehicle?.owner?._id?.toString?.() || vehicle?.owner?.toString?.();
};

// ================= CREATE BOOKING =================
export const createBookingService = async ({ body, userId }) => {
  const {
    vehicleId,
    startDate,
    endDate,
    pickupLocation,
    dropLocation,
  } = body;

  

  const vehicle = await Vehicle.findById(vehicleId).select(
    "name brand pricePerDay pricePerHour images status owner",
  );

  if (getOwnerId(vehicle) === userId) {
    throw new Error("Cannot book your own vehicle");
  }

  if (!vehicle) throw new Error("Vehicle not found");
  if (vehicle.status === "inactive") throw new Error("Vehicle not available");

  const user = await User.findById(userId).select("name email phone");
  if (!user) throw new Error("User not found");

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (isNaN(start) || isNaN(end)) throw new Error("Invalid date");
  if (end <= start) throw new Error("End date must be after start date");

  const minAdvance = new Date(
    now.getTime() + BOOKING_PRICING.MIN_ADVANCE_BOOKING_HOURS * 60 * 60 * 1000,
  );
  if (start < minAdvance) {
    throw new Error("Booking must be at least 1 hour in advance");
  }

  const totalHours = Math.ceil((end - start) / (1000 * 60 * 60));

  let bookingType = "hourly";
  let duration = totalHours;

  if (totalHours > 24) {
    bookingType = "daily";
    duration = Math.ceil(totalHours / 24);
  }

  const existingBooking = await Booking.findOne({
    vehicle: vehicleId,
    isDeleted: false,
    status: {
      $in: ["pending", "approved", "confirmed", "ongoing"],
    },
    startDate: { $lt: end },
    endDate: { $gt: start },
  });

  if (existingBooking) {
    throw new Error("Vehicle already booked for selected time");
  }

  const { basePrice, surgeAmount, tax, extraCharges, discount, finalPrice } =
    await calculateBookingPrice({
      vehicle,
      start,
      end,
      bookingType,
      pickupLocation,
    });

  const booking = await Booking.create({
    user: userId,
    vehicle: vehicleId,
    startDate: start,
    endDate: end,
    bookingType,
    duration,
    pickupLocation,
    dropLocation,
    expiresAt: new Date(
      now.getTime() + BOOKING_PRICING.BOOKING_EXPIRY_MINUTES * 60 * 1000,
    ),

    pricePaidByCustomer: finalPrice,
    priceBreakdown: {
      basePrice,
      surgeAmount,
      extraCharges,
      tax,
      discount,
      finalPrice,
    },

    

    securityDeposit: {
      amount: vehicle.securityDeposit,
      status: "pending",
      deductionAmount: 0,
    },

    customerDetails: {
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
    vehicleSnapshot: {
      name: vehicle.name,
      brand: vehicle.brand,
      pricePerDay: vehicle.pricePerDay,
      pricePerHour: vehicle.pricePerHour,
      image: vehicle.images?.[0] || null,
    },

    payment: {
      amount: finalPrice,
      status: "pending",
    },

    status: "pending",
  });

  return booking;
};

// ================= APPROVE =================
export const approveBookingService = async (bookingNumber, user) => {
  const booking = await Booking.findOne({
    bookingNumber,
    isDeleted: false,
  }).populate("vehicle", "owner");

  if (!booking) throw new Error("Booking not found");

  if (booking.status === "expired") throw new Error("Booking expired");

  if (booking.status === "approved")
    throw new Error("Booking already approved");

  const invalidStatuses = ["cancelled", "completed", "ongoing"];

  if (invalidStatuses.includes(booking.status)) {
    throw new Error(`Cannot approve a ${booking.status} booking`);
  }

  if (booking.vehicle.status === "inactive") {
    throw new Error("Vehicle is not available");
  }

  const ownerId = getOwnerId(booking.vehicle);
  if (!canManageResource(ownerId, user)) {
    throw new Error("Not allowed to approve");
  }

  booking.status = "approved";
  booking.approvedAt = new Date();
  booking.approvedBy = user.id;

  booking.activityLogs.push({
    action: "APPROVED",
    performedBy: user._id || user.id,
  });

  await booking.save();
  return booking;
};



// Auto confirm for online payments after payment success webhook
export const handleOnlinePaymentSuccessService = async ({
  bookingNumber,
  paymentId,
  orderId,
  method,
  securityDepositTransactionId,
  securityDepositMethod,
  userId, // system user or null if webhook
}) => {
  const booking = await Booking.findOne({
    bookingNumber,
    isDeleted: false,
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  // idempotency check
  if (booking.status === "confirmed") {
    return booking;
  }

  if (booking.status !== "approved") {
    throw new Error("Booking must be approved first");
  }

  if (!booking.securityDeposit?.amount) {
    throw new Error("Security deposit not configured");
  }

  // SECURITY DEPOSIT
  if (booking.securityDeposit.status === "pending") {
    booking.securityDeposit.status = "held";
    booking.securityDeposit.collectedAt = new Date();
    booking.securityDeposit.paymentMethod = securityDepositMethod || "online";
    booking.securityDeposit.transactionId =
      securityDepositTransactionId || null;
  }

  // PAYMENT
  booking.payment.paymentId = paymentId;
  booking.payment.orderId = orderId;
  booking.payment.method = method;
  booking.payment.status = "paid";
  booking.payment.paidAt = new Date();

  //pickup otp
  booking.pickupOTP = Math.floor(10000 + Math.random() * 90000).toString();
  booking.pickupOTPVerified = false;

  booking.status = "confirmed";
  booking.confirmedAt = new Date();
  booking.confirmedBy = userId || null;

  await booking.save();

  return booking;
};

// ================= START =================
export const startBookingService = async (bookingNumber, otp, user) => {
  const booking = await Booking.findOne({
    bookingNumber,
    isDeleted: false,
  }).populate("vehicle", "owner");

  if (!booking) throw new Error("Booking not found");
  if (booking.status === "expired") throw new Error("Booking expired");
  if (booking.status !== "confirmed")
    throw new Error("Only confirmed bookings can be started");

  if (booking.pickupOTP !== otp) {
    throw new Error("Invalid pickup OTP");
  }

  if (new Date() < booking.startDate) {
    throw new Error("Trip cannot start before start time");
  }

  const ownerId = getOwnerId(booking.vehicle);
  if (!canManageResource(ownerId, user)) {
    throw new Error("Not allowed to start");
  }

  booking.status = "ongoing";
  booking.startedAt = new Date();
  booking.pickupOTP = null;
  booking.dropOTP = Math.floor(10000 + Math.random() * 90000).toString();

  await booking.save();
  return {
    success: true,
    message: "Booking started successfully",
    bookingNumber: booking.bookingNumber,
    status: booking.status,
  };
};

// ================= COMPLETE =================
export const completeBookingService = async (
  bookingNumber,
  deductionAmount,
  deductionReason,
  otp,
  user,
) => {
  const booking = await Booking.findOne({
    bookingNumber,
    isDeleted: false,
  }).populate("vehicle", "owner");

  if (!booking) throw new Error("Booking not found");
  if (booking.status !== "ongoing")
    throw new Error("Only ongoing bookings can be completed");
  if (booking.dropOTP !== otp) {
    throw new Error("Invalid drop OTP");
  }
  const ownerId = getOwnerId(booking.vehicle);
  if (!canManageResource(ownerId, user)) {
    throw new Error("Not allowed to complete");
  }

  booking.status = "completed";
  booking.completedAt = new Date();

  // deducted, partially return security deposit
  if (deductionAmount && deductionAmount > 0) {
    booking.securityDeposit.deductionAmount = deductionAmount;

    booking.securityDeposit.deductionReason =
      deductionReason || "Damage or issue during trip";

    booking.securityDeposit.deductedAt = new Date();
    booking.securityDeposit.status = "deducted";

    booking.securityDeposit.refundAmount = Math.max(
      0,
      booking.securityDeposit.amount - deductionAmount,
    );

    booking.securityDeposit.returnedAt = new Date();
  } else {
    booking.securityDeposit.status = "returned";
    booking.securityDeposit.refundAmount = booking.securityDeposit.amount;
    booking.securityDeposit.returnedAt = new Date();
  }

  booking.dropOTP = null;
  await booking.save();

  return {
    success: true,
    message: "Booking completed successfully",
    bookingNumber: booking.bookingNumber,
    status: booking.status,
    completedAt: booking.completedAt,
  };
};

// ================= CANCEL =================
export const cancelBookingService = async (
  bookingNumber,
  user,
  cancelReason,
) => {
  const booking = await Booking.findOne({
    bookingNumber,
    isDeleted: false,
  })
    .populate("vehicle", "owner")
    .populate("user", "_id");

  if (!booking) {
    throw new Error("Booking not found");
  }

  // ❌ block ongoing/completed
  if (["ongoing", "completed"].includes(booking.status)) {
    throw new Error("Cannot cancel ongoing or completed booking");
  }

  const isCustomer = booking.user._id.toString() === user._id.toString();

  const ownerId = getOwnerId(booking.vehicle);

  const canCancel = isCustomer || canManageResource(ownerId, user);

  if (!canCancel) {
    throw new Error("Not allowed to cancel");
  }

  booking.status = "cancelled";
  booking.cancelledAt = new Date();
  booking.cancelledBy = user._id;
  booking.cancelledByRole = user.role;
  booking.cancelReason = cancelReason || "No reason provided";

  // PAYMENT HANDLING
  if (booking.payment.status === "paid") {
    booking.payment.status = "refunded_pending"; // FIXED
  }

  // SECURITY DEPOSIT HANDLING
  if (booking.securityDeposit.status === "held") {
    booking.securityDeposit.status = "release_pending"; // FIXED
  }

  await booking.save();

  return {
    success: true,
    message: "Booking cancelled successfully",
    bookingNumber: booking.bookingNumber,
    status: booking.status,
  };
};

// ================= EXPIRE =================
export const autoExpireBookingsService = async () => {
  const result = await Booking.updateMany(
    {
      status: "pending",
      expiresAt: { $lt: new Date() },
      isDeleted: false,
    },
    {
      $set: {
        status: "expired",
        cancelReason: "Booking expired due to timeout",
        cancelledAt: new Date(),
      },
    },
  );

  return result.modifiedCount;
};

// current active booking for user
export const getMyCurrentBookingService = async (userId) => {
  const booking = await Booking.findOne({
    user: userId,
    isDeleted: false,
    status: {
      $in: ["pending", "approved", "confirmed", "ongoing"],
    },
  })
    .select("+pickupOTP +dropOTP")
    .populate("vehicle", "name brand images pricePerDay pricePerHour")
    .sort({ createdAt: -1 });

  return booking;
};

// all bookings for user
export const getMyBookingByNumberService = async (bookingNumber, userId) => {
  const booking = await Booking.findOne({
    bookingNumber,
    user: userId,
    isDeleted: false,
  })
    .select("+pickupOTP +dropOTP")
    .populate("vehicle", "name brand images pricePerDay pricePerHour");

  if (!booking) {
    throw new Error("Booking not found");
  }

  return booking;
};

// get booking history
export const getMyBookingHistoryService = async (
  userId,
  page = 1,
  limit = 10,
) => {
  const skip = (page - 1) * limit;

  const filter = {
    user: userId,
    isDeleted: false,
    status: {
      $in: ["completed", "cancelled", "expired"],
    },
  };

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate("vehicle", "name brand images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Booking.countDocuments(filter),
  ]);

  return {
    bookings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// current active bookings for vendor
export const getVendorCurrentBookingsService = async ({
  vendorId,
  page = 1,
  limit = 10,
}) => {
  const skip = (page - 1) * limit;

  const filter = {
    vendor: vendorId,
    isDeleted: false,
    status: {
      $in: ["pending", "approved", "confirmed", "ongoing"],
    },
  };

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate("vehicle", "name brand images")
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Booking.countDocuments(filter),
  ]);

  return {
    bookings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// vendor booking history
export const getVendorBookingHistoryService = async ({
  vendorId,
  page = 1,
  limit = 10,
}) => {
  const skip = (page - 1) * limit;

  const filter = {
    vendor: vendorId,
    isDeleted: false,
    status: {
      $in: ["completed", "cancelled", "expired"],
    },
  };

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate("vehicle", "name brand images")
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Booking.countDocuments(filter),
  ]);

  return {
    bookings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// get booking by number for vendor
export const getVendorBookingByNumberService = async (bookingNumber, user) => {
  const booking = await Booking.findOne({
    bookingNumber,
    isDeleted: false,
  })
    .populate("vehicle", "owner")
    .populate("user", "name email phone");

  if (!booking) throw new Error("Booking not found");

  const ownerId = getOwnerId(booking.vehicle);

  if (!canManageResource(ownerId, user)) {
    throw new Error("Not allowed");
  }

  return booking;
};

// ================= DELETE =================
export const deleteBookingService = async (bookingNumber, user) => {
  const booking = await Booking.findOne({
    bookingNumber,
    isDeleted: false,
  })
    .populate("vehicle", "owner")
    .populate("user", "_id");

  if (!booking) throw new Error("Booking not found");

  if (
    ["confirmed", "ongoing", "completed"].includes(booking.status) ||
    booking.payment.status === "paid" ||
    booking.securityDeposit.status === "held"
  ) {
    throw new Error("Cannot delete ongoing or completed booking");
  }
  const allowed = canManageResource(getOwnerId(booking.vehicle), user);

  if (!allowed) throw new Error("Not allowed to delete");

  booking.isDeleted = true;
  booking.cancelledBy = user._id;
  booking.cancelledByRole = user.role;
  booking.cancelledAt = new Date();
  await booking.save();

  return true;
};

// ================= RESTORE =================
export const restoreBookingService = async (bookingNumber, user) => {
  const booking = await Booking.findOne({
    bookingNumber,
    isDeleted: true,
  })
    .populate("vehicle", "owner")
    .populate("user", "_id");

  if (!booking) throw new Error("Booking not found");

  const allowed = canManageResource(getOwnerId(booking.vehicle), user);

  if (!allowed) throw new Error("Not allowed to restore");

  if (
    booking.payment.status === "paid" ||
    booking.securityDeposit.status === "held"
  ) {
    throw new Error("Cannot restore financial booking");
  }
  booking.isDeleted = false;
  await booking.save();

  return true;
};
