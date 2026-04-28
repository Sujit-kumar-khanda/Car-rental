import Booking from "../models/bookingModel.js";
import Vehicle from "../models/vechileModel.js";
import User from "../models/userModel.js";
import Holiday from "../models/holidayModel.js";
import { calculatePrice } from "./pricingService.js";

// CREATE BOOKING
export const createBookingService = async (req) => {
  const {
    vehicleId,
    startDate,
    endDate,
    pickupLocation,
    dropLocation,
  } = req.body;

  const userId = req.user.id;

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) throw new Error("Vehicle not found");

  if (vehicle.status === "inactive") {
    throw new Error("Vehicle not available");
  }

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (isNaN(start) || isNaN(end)) {
    throw new Error("Invalid date");
  }

  if (end <= start) {
    throw new Error("End date must be after start date");
  }

  // minimum advance booking = 1 hour
  const minAdvance = new Date(now.getTime() + 60 * 60 * 1000);

  if (start < minAdvance) {
    throw new Error("Booking must be at least 1 hour in advance");
  }

  // total hours
  const totalHours = Math.ceil((end - start) / (1000 * 60 * 60));

  let bookingType = "hourly";
  let duration = totalHours;

  if (totalHours > 24) {
    bookingType = "daily";
    duration = Math.ceil(totalHours / 24);
  }

  // overlap check
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
  //base price + surge + tax - discount + extra charges
  const { totalPrice } = await calculatePrice(
    vehicle,
    start,
    end,
    bookingType
  );

  let basePrice = totalPrice;
  let surgeAmount = 0;

  // =====================================
  // HOLIDAY SURGE CHECK
  // =====================================
  const holiday = await Holiday.findOne({
    isActive: true,
    startDate: { $lte: start },
    endDate: { $gte: start },
  });

  if (holiday) {
    if (holiday.surgeType === "multiplier") {
      const surgedPrice = Math.round(
        basePrice * holiday.surgeValue
      );

      surgeAmount = surgedPrice - basePrice;
      basePrice = surgedPrice;
    } else {
      surgeAmount = holiday.surgeValue;
      basePrice += holiday.surgeValue;
    }
  }

  // tax
  const tax = Math.round(basePrice * 0.18);

  // extra charges
  let extraCharges = 0;

  if (pickupLocation?.address) extraCharges += 50;

  const startHour = start.getHours();
  if (startHour >= 20 || startHour < 6) {
    extraCharges += 100;
  }

  const finalPrice = Math.round(
    basePrice + surgeAmount + tax + extraCharges
  );

  const expiresAt = new Date(
    now.getTime() + 15 * 60 * 1000
  );

  const booking = await Booking.create({
    user: userId,
    vehicle: vehicleId,

    startDate: start,
    endDate: end,

    bookingType,
    duration,

    pickupLocation,
    dropLocation,

    expiresAt,

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

    status: "pending",
  });

  return booking;
};

// APPROVE BOOKING
export const approveBookingService = async (bookingId, user) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) throw new Error("Booking not found");

  if (booking.status !== "pending") {
    throw new Error("Only pending bookings can be approved");
  }

  booking.status = "approved";
  booking.approvedAt = new Date();
  booking.approvedBy = user.id;

  await booking.save();

  return booking;
};

// CANCEL BOOKING
export const cancelBookingService = async (
  bookingId,
  user,
  cancelReason
) => {
  const booking = await Booking.findById(bookingId).populate(
    "vehicle",
    "createdBy"
  );

  if (!booking) throw new Error("Booking not found");

  if (booking.status === "cancelled") {
    throw new Error("Booking already cancelled");
  }

  if (booking.status === "completed") {
    throw new Error("Completed booking cannot be cancelled");
  }

  const isOwner = booking.user.toString() === user.id;
  const isAdminOwner =
    booking.vehicle?.createdBy?.toString() === user.id;
  const isSuperAdmin = user.role === "superadmin";

  if (!isOwner && !isAdminOwner && !isSuperAdmin) {
    throw new Error("Not allowed to cancel");
  }

  booking.status = "cancelled";
  booking.cancelledAt = new Date();
  booking.cancelledBy = user.id;
  booking.cancelReason = cancelReason || "No reason provided";

  await booking.save();

  return booking;
};

// USER BOOKINGS
export const getUserBookingsService = async (userId) => {
  return await Booking.find({
    user: userId,
    isDeleted: false,
  })
    .populate("vehicle")
    .sort({ createdAt: -1 });
};

// VEHICLE BOOKINGS (ADMIN)
export const getVehicleBookingsService = async (adminId) => {
  const vehicles = await Vehicle.find({
    createdBy: adminId,
  });

  const vehicleIds = vehicles.map((v) => v._id);

  return await Booking.find({
    vehicle: { $in: vehicleIds },
    isDeleted: false,
  })
    .populate("vehicle")
    .populate("user", "-password")
    .sort({ createdAt: -1 });
};

// SINGLE BOOKING
export const getBookingByIdService = async (bookingId, user) => {
  const booking = await Booking.findById(bookingId)
    .populate("vehicle")
    .populate("user", "-password");

  if (!booking) throw new Error("Booking not found");

  const isOwner = booking.user._id.toString() === user.id;
  const isAdminOwner =
    booking.vehicle.createdBy.toString() === user.id;
  const isSuperAdmin = user.role === "superadmin";

  if (!isOwner && !isAdminOwner && !isSuperAdmin) {
    throw new Error("Not allowed");
  }

  return booking;
};

// DELETE BOOKING
export const deleteBookingService = async (bookingId) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) throw new Error("Booking not found");

  booking.isDeleted = true;

  await booking.save();

  return true;
};