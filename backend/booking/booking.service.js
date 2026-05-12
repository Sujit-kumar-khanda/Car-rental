import Booking from "../models/bookingModel.js";
import Vehicle from "../models/vechileModel.js";
import User from "../models/userModel.js";
import { BOOKING_STATUS, BOOKING_PRICING } from "../booking.constants.js";
import { calculateBookingPrice } from "./pricing/pricing.service.js";
import { canManageResource } from "../utils/authorization.js";

// ================= SAFE OWNER HELPER =================
const getOwnerId = (vehicle) => {
  return vehicle?.owner?._id?.toString?.() || vehicle?.owner?.toString?.();
};

// ================= CREATE BOOKING =================
export const createBookingService = async ({
  vehicleId,
  startDate,
  endDate,
  pickupLocation,
  dropLocation,
  userId,
}) => {
  const vehicle = await Vehicle.findById(vehicleId).select(
    "name brand pricePerDay pricePerHour images status owner"
  );

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
    now.getTime() + BOOKING_PRICING.MIN_ADVANCE_BOOKING_HOURS * 60 * 60 * 1000
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
      $in: [
        BOOKING_STATUS.PENDING,
        BOOKING_STATUS.APPROVED,
        BOOKING_STATUS.CONFIRMED,
        BOOKING_STATUS.ONGOING,
      ],
    },
    startDate: { $lte: end },
    endDate: { $gte: start },
  });

  if (existingBooking) {
    throw new Error("Vehicle already booked for selected time");
  }

  const { basePrice, surgeAmount, tax, extraCharges, finalPrice } =
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
      now.getTime() + BOOKING_PRICING.BOOKING_EXPIRY_MINUTES * 60 * 1000
    ),
    pricePaidByCustomer: finalPrice,
    priceBreakdown: {
      basePrice,
      surgeAmount,
      tax,
      extraCharges,
      finalPrice,
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
    status: BOOKING_STATUS.PENDING,
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
  if (booking.status === BOOKING_STATUS.EXPIRED)
    throw new Error("Booking expired");
  if (booking.status !== BOOKING_STATUS.PENDING)
    throw new Error("Only pending bookings can be approved");

  const ownerId = getOwnerId(booking.vehicle);
  if (!canManageResource(ownerId, user)) {
    throw new Error("Not allowed to approve");
  }

  booking.status = BOOKING_STATUS.APPROVED;
  booking.approvedAt = new Date();
  booking.approvedBy = user.id;

  await booking.save();
  return booking;
};

// ================= CONFIRM =================
export const confirmBookingService = async (bookingNumber, user) => {
  const booking = await Booking.findOne({
    bookingNumber,
    isDeleted: false,
  }).populate("vehicle", "owner");

  if (!booking) throw new Error("Booking not found");
  if (booking.status === BOOKING_STATUS.EXPIRED)
    throw new Error("Booking expired");
  if (booking.status !== BOOKING_STATUS.APPROVED)
    throw new Error("Only approved bookings can be confirmed");

  const ownerId = getOwnerId(booking.vehicle);
  if (!canManageResource(ownerId, user)) {
    throw new Error("Not allowed to confirm");
  }

  booking.status = BOOKING_STATUS.CONFIRMED;
  booking.confirmedAt = new Date();
  booking.confirmedBy = user.id;

  await booking.save();
  return booking;
};

// ================= START =================
export const startBookingService = async (bookingNumber, user) => {
  const booking = await Booking.findOne({
    bookingNumber,
    isDeleted: false,
  }).populate("vehicle", "owner");

  if (!booking) throw new Error("Booking not found");
  if (booking.status === BOOKING_STATUS.EXPIRED)
    throw new Error("Booking expired");
  if (booking.status !== BOOKING_STATUS.CONFIRMED)
    throw new Error("Only confirmed bookings can be started");

  if (new Date() < booking.startDate) {
    throw new Error("Trip cannot start before start time");
  }

  const ownerId = getOwnerId(booking.vehicle);
  if (!canManageResource(ownerId, user)) {
    throw new Error("Not allowed to start");
  }

  booking.status = BOOKING_STATUS.ONGOING;
  booking.startedAt = new Date();

  await booking.save();
  return booking;
};

// ================= COMPLETE =================
export const completeBookingService = async (bookingNumber, user) => {
  const booking = await Booking.findOne({
    bookingNumber,
    isDeleted: false,
  }).populate("vehicle", "owner");

  if (!booking) throw new Error("Booking not found");
  if (booking.status !== BOOKING_STATUS.ONGOING)
    throw new Error("Only ongoing bookings can be completed");

  const ownerId = getOwnerId(booking.vehicle);
  if (!canManageResource(ownerId, user)) {
    throw new Error("Not allowed to complete");
  }

  booking.status = BOOKING_STATUS.COMPLETED;
  booking.completedAt = new Date();

  await booking.save();
  return booking;
};

// ================= CANCEL =================
export const cancelBookingService = async (
  bookingNumber,
  user,
  cancelReason
) => {
  const booking = await Booking.findOne({
    bookingNumber,
    isDeleted: false,
  })
    .populate("vehicle", "owner")
    .populate("user", "_id");

  if (!booking) throw new Error("Booking not found");

  if (booking.status === BOOKING_STATUS.EXPIRED)
    throw new Error("Cannot cancel expired booking");

  if (
    [BOOKING_STATUS.COMPLETED].includes(booking.status)
  ) {
    throw new Error("Cannot cancel completed booking");
  }

  const canCancel =
    canManageResource(booking.user, user) ||
    canManageResource(getOwnerId(booking.vehicle), user);

  if (!canCancel) throw new Error("Not allowed to cancel");

  booking.status = BOOKING_STATUS.CANCELLED;
  booking.cancelledAt = new Date();
  booking.cancelledBy = user.id;
  booking.cancelReason = cancelReason || "No reason provided";

  await booking.save();
  return booking;
};

// ================= EXPIRE =================
export const expireBookingsService = async () => {
  const result = await Booking.updateMany(
    {
      status: BOOKING_STATUS.PENDING,
      expiresAt: { $lt: new Date() },
      isDeleted: false,
    },
    {
      $set: { status: BOOKING_STATUS.EXPIRED },
    }
  );

  return result.modifiedCount;
};

// ================= USER BOOKINGS =================
export const getUserBookingsService = async (userId) => {
  return Booking.find({
    user: userId,
    isDeleted: false,
  })
    .populate("vehicle")
    .sort({ createdAt: -1 })
    .lean();
};

// ================= VEHICLE BOOKINGS =================
export const getVehicleBookingsService = async (adminId) => {
  const vehicles = await Vehicle.find({ owner: adminId });

  const vehicleIds = vehicles.map((v) => v._id);

  return Booking.find({
    vehicle: { $in: vehicleIds },
    isDeleted: false,
  })
    .populate("vehicle")
    .populate("user", "-password")
    .sort({ createdAt: -1 })
    .lean();
};

// ================= SINGLE BOOKING =================
export const getBookingByIdService = async (bookingNumber, user) => {
  const booking = await Booking.findOne({
    bookingNumber,
    isDeleted: false,
  })
    .populate("vehicle", "owner")
    .populate("user", "-password")
    .lean();

  if (!booking) throw new Error("Booking not found");

  const canAccess =
    canManageResource(booking.user, user) ||
    canManageResource(getOwnerId(booking.vehicle), user);

  if (!canAccess) throw new Error("Not allowed");

  return booking;
};

// ================= DELETE =================
export const deleteBookingService = async (bookingNumber, user) => {
  const booking = await Booking.findOne({
    bookingNumber,
    isDeleted: false,
  }).select("user");

  if (!booking) throw new Error("Booking not found");

  const allowed = canManageResource(booking.user, user);
  if (!allowed) throw new Error("Not allowed to delete");

  booking.isDeleted = true;
  await booking.save();

  return true;
};