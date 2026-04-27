import Booking from "../models/bookingModel.js";
import Vehicle from "../models/vechileModel.js";

// Create Booking (User Only)
export const createBookingService = async (req) => {
  const { vehicleId, startDate, endDate, bookingType } = req.body;

  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  if (!vehicle.isAvailable) {
    throw new Error("Vehicle not available");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start) || isNaN(end)) {
    throw new Error("Invalid booking dates");
  }

  let totalPrice = 0;

  // HOURLY BOOKING
  if (bookingType === "hourly") {
    const hours = (end - start) / (1000 * 60 * 60);

    if (hours <= 0) {
      throw new Error("Invalid time range");
    }

    if (!vehicle.pricePerHour) {
      throw new Error("Hourly booking not available for this vehicle");
    }

    totalPrice = hours * vehicle.pricePerHour;
  }

  // DAILY BOOKING (default)
  else {
    const days = (end - start) / (1000 * 60 * 60 * 24);

    if (days <= 0) {
      throw new Error("Invalid dates");
    }

    totalPrice = days * vehicle.pricePerDay;
  }

  // prevent double booking
  const existingBooking = await Booking.findOne({
    vehicle: vehicleId,
    status: { $in: ["pending", "approved"] },
    startDate: { $lt: end },
    endDate: { $gt: start },
  });

  if (existingBooking) {
    throw new Error("Vehicle already booked for selected dates");
  }

  return await Booking.create({
    bookingId: "BK" + Date.now(),
    user: req.user.id,
    vehicle: vehicleId,
    startDate,
    endDate,
    bookingType,
    totalPrice,
    securityDeposit: vehicle.securityDeposit,
    pickupAddress: vehicle.pickupAddress,
    status: "pending",
  });
};

// Approve Booking (Admin Only)
export const approveBookingService = async (id) => {
  const booking = await Booking.findById(id);

  if (!booking) {
    throw new Error("Booking not found");
  }

  booking.status = "approved";
  booking.approvedAt = new Date();

  // optional: make vehicle unavailable
  await Vehicle.findByIdAndUpdate(booking.vehicle, {
    // give one document of vehicle schema which have same id as booking.vehicle and update isAvailable to false
    isAvailable: false,
  });

  await booking.save();

  return booking;
};

// Cancel Booking (User or Admin)
export const cancelBookingService = async (req) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new Error("Booking not found");
  }

  booking.status = "cancelled";
  booking.cancelledAt = new Date();
  booking.cancelReason = req.body.cancelReason || "";

  // make vehicle available again
  await Vehicle.findByIdAndUpdate(booking.vehicle, {
    isAvailable: true,
  });

  await booking.save();

  return booking;
};

// Complete Booking (Admin Only)
export const completeBookingService = async (id) => {
  const booking = await Booking.findById(id);

  if (!booking) {
    throw new Error("Booking not found");
  }

  booking.status = "completed";
  booking.completedAt = new Date();

  await Vehicle.findByIdAndUpdate(booking.vehicle, {
    isAvailable: true,
  });

  await booking.save();

  return booking;
};

// Get User's Bookings
export const getUserBookingsService = async (userId) => {
  return await Booking.find({ user: userId}) // give all documents of booking schema which have user id same as req.user.id
    .populate("vehicle") // convert vechile id to vechile document and give all elements of vechile schema
    .sort({ createdAt: -1 }); // sort by createdAt in descending order (Latest first)
};

// Get All Bookings (Admin Only)
export const getAllBookingsService = async () => {
  return await Booking.find() // get every document of booking schema
    .populate("user") // convert user id to user document and give all elements of user schema
    .populate("vehicle") // convert vehicle id to vehicle document and give all elements of vehicle schema
    .sort({ createdAt: -1 }); // sort by createdAt in descending order (latest first)
};

// Get Booking by ID
export const getBookingByIdService = async (id) => {
  return await Booking.findById(id).populate("user").populate("vehicle");
};

// Delete Booking
export const deleteBookingService = async (id) => {
  const booking = await Booking.findById(id);

  if (!booking) {
    throw new Error("Booking not found");
  }

  await booking.deleteOne();
};