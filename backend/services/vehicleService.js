// ==========================================
// services/vehicleService.js
// FULL INDUSTRY LEVEL VERSION
// Matches your latest Vehicle Model + Booking Model
// ==========================================

import mongoose from "mongoose";
import Vehicle from "../models/vechileModel.js";
import Booking from "../models/bookingModel.js";

// ==========================================
// ADD VEHICLE
// ==========================================
export const addVehicleService = async (req) => {
  const {
    name,
    brand,
    model,
    year,
    segment,
    features,
    type,
    pricePerDay,
    pricePerHour,
    securityDeposit,
    fuelType,
    transmission,
    seats,
    mileage,
    color,
    images,
    city,
    state,
    pickupAddress,
    category,
    description,
  } = req.body;

  const vehicle = await Vehicle.create({
    name,
    brand,
    model,
    year,
    segment,
    features,
    type,
    owner: req.user.id,

    pricePerDay,
    pricePerHour,
    securityDeposit,

    fuelType,
    transmission,
    seats,
    mileage,
    color,

    images,

    city,
    state,
    pickupAddress,

    category,
    description,

    status: "inactive", // default to inactive until approved by admin
    approvalStatus: "pending",
    isAvailable: false,
  });

  return vehicle;
};

// ==========================================
// GET ALL VEHICLES (FILTER + SEARCH)
// ==========================================
export const getAllVehiclesService = async (query) => {
  const filter = {
    approvalStatus: "approved",
    status: "active",
    isAvailable: true,
  };

  if (query.city) filter.city = query.city;
  if (query.type) filter.type = query.type;
  if (query.brand) filter.brand = query.brand;
  if (query.category) filter.category = query.category;
  if (query.segment) filter.segment = query.segment;

  const vehicles = await Vehicle.find(filter).sort({
    createdAt: -1,
  });

  return vehicles;
};

// ==========================================
// GET SINGLE VEHICLE
// ==========================================
export const getVehicleByIdService = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid vehicle ID");
  }

  const vehicle = await Vehicle.findById(id);

  if (!vehicle || vehicle.status !== "active") {
    throw new Error("Vehicle not found");
  }

  return vehicle;
};

// ==========================================
// UPDATE VEHICLE
// Only Owner or Superadmin
// ==========================================
export const updateVehicleService = async (req) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  const isOwner = vehicle.owner.toString() === req.user.id;
  const isSuperAdmin = req.user.role === "superadmin";

  if (!isOwner && !isSuperAdmin) {
    throw new Error("Not allowed");
  }

  // Only allow safe editable fields
  const allowedFields = [
    "name",
    "brand",
    "model",
    "year",
    "segment",
    "features",
    "type",
    "pricePerDay",
    "pricePerHour",
    "securityDeposit",
    "fuelType",
    "transmission",
    "seats",
    "mileage",
    "color",
    "images",
    "city",
    "state",
    "pickupAddress",
    "category",
    "description",
  ];

  // Fields that require re-approval
  const approvalFields = [
    "pricePerDay",
    "pricePerHour",
    "city",
    "images",
    "fuelType",
    "category",
    "type",
  ];

  let needsReapproval = false;

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      vehicle[field] = req.body[field];

      if (approvalFields.includes(field)) {
        needsReapproval = true;
      }
    }
  });

  // If sensitive data changed, send for approval again
  if (needsReapproval) {
    vehicle.approvalStatus = "pending";
    vehicle.status = "inactive";
    vehicle.isAvailable = false;
    vehicle.approvedBy = null;
    vehicle.approvedAt = null;
  }

  await vehicle.save();

  return vehicle;
};

// ==========================================
// DELETE VEHICLE / MAKE INACTIVE
// ==========================================
export const deleteVehicleService = async (vehicleId, user) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const vehicle = await Vehicle.findById(vehicleId).session(session);

    if (!vehicle) {
      throw new Error("Vehicle not found");
    }

    const isOwner = vehicle.owner.toString() === user.id;
    const isSuperAdmin = user.role === "superadmin";

    if (!isOwner && !isSuperAdmin) {
      throw new Error("Not allowed");
    }

    if (vehicle.status === "inactive") {
      throw new Error("Vehicle already inactive");
    }

    const now = new Date();

    // Make vehicle unavailable
    vehicle.status = "inactive";
    vehicle.isAvailable = false;

    // ------------------------------------
    // Cancel future pending / approved bookings
    // ------------------------------------
    await Booking.updateMany(
      {
        vehicle: vehicle._id,
        status: { $in: ["pending", "approved"] },
        startDate: { $gt: now },
      },
      {
        $set: {
          status: "cancelled",
          cancelReason: "Vehicle unavailable",
          cancelledAt: now,
        },
      },
      { session }
    );

    // ------------------------------------
    // Refund future confirmed paid bookings
    // ------------------------------------
    const confirmedBookings = await Booking.find(
      {
        vehicle: vehicle._id,
        status: "confirmed",
        startDate: { $gt: now },
        "payment.status": "paid",
      },
      null,
      { session }
    );

    for (const booking of confirmedBookings) {
      booking.status = "cancelled";
      booking.cancelReason = "Vehicle unavailable";
      booking.cancelledAt = now;

      booking.payment.status = "refunded";
      booking.payment.refundAmount =
        booking.pricePaidByCustomer;
      booking.payment.refundedAt = now;

      await booking.save({ session });
    }

    // ------------------------------------
    // Interrupt ongoing trips
    // ------------------------------------
    await Booking.updateMany(
      {
        vehicle: vehicle._id,
        status: "ongoing",
      },
      {
        $set: {
          status: "interrupted",
          cancelReason:
            "Vehicle became unavailable during trip",
          cancelledAt: now,
        },
      },
      { session }
    );

    await vehicle.save({ session });

    await session.commitTransaction();
    session.endSession();

    return true;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// ==========================================
// DELETE SINGLE IMAGE
// ==========================================
export const deleteVehicleImageService = async (req) => {
  const { imageUrl } = req.body;

  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  const isOwner = vehicle.owner.toString() === req.user.id;
  const isSuperAdmin = req.user.role === "superadmin";

  if (!isOwner && !isSuperAdmin) {
    throw new Error("Not allowed");
  }

  vehicle.images = vehicle.images.filter(
    (img) => img !== imageUrl
  );

  await vehicle.save();

  return vehicle.images;
};

// ==========================================
// TOGGLE AVAILABILITY
// ==========================================
export const toggleAvailabilityService = async (
  vehicleId,
  user
) => {
  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  const isOwner = vehicle.owner.toString() === user.id;
  const isSuperAdmin = user.role === "superadmin";

  if (!isOwner && !isSuperAdmin) {
    throw new Error("Not allowed");
  }

  if (vehicle.status !== "active") {
    throw new Error("Only active vehicle can change availability");
  }

  vehicle.isAvailable = !vehicle.isAvailable;

  await vehicle.save();

  return vehicle.isAvailable;
};

// ==========================================
// APPROVE VEHICLE (SUPERADMIN)
// ==========================================
export const approveVehicleService = async (
  vehicleId,
  adminId
) => {
  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  vehicle.approvalStatus = "approved";
  vehicle.status = "active";
  vehicle.isAvailable = true;
  vehicle.approvedBy = adminId;
  vehicle.approvedAt = new Date();

  await vehicle.save();

  return vehicle;
};

// ==========================================
// REJECT VEHICLE
// ==========================================
export const rejectVehicleService = async (
  vehicleId,
  adminId
) => {
  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  vehicle.approvalStatus = "rejected";
  vehicle.status = "inactive";
  vehicle.isAvailable = false;
  vehicle.approvedBy = adminId;
  vehicle.approvedAt = new Date();

  await vehicle.save();

  return vehicle;
};