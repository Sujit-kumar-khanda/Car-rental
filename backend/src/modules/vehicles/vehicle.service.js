import mongoose from "mongoose";
import Vehicle from "./vehicle.model.js";
import Booking from "../models/bookingModel.js";
import { canManageResource } from "../../utils/permission.js";
import User from "../users/user.model.js";

// ADD VEHICLE
export const addVehicleService = async (body, files, userId) => {
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
    city,
    state,
    pickupAddress,
    category,
    description,
  } = body;

  const images = files ? files.map((file) => `uploads/${file.filename}`) : []; // Handle multiple image uploads

  const vendor = await User.findById(userId);

  if (!vendor) {
    throw new Error("User not found");
  }

  if (!vendor.isActive) {
    throw new Error("User is not active. Cannot add vehicle.");
  }

  // Validate required fields
  if (
    !name ||
    !brand ||
    !year ||
    !type ||
    !pricePerDay ||
    !mileage ||
    !color ||
    !city ||
    !state ||
    !pickupAddress ||
    !category
  ) {
    return res
      .status(400)
      .json({ message: "Please fill in all required fields" });
  }
  // seat is required for cars but not for bikes
  if (type === "Car" && (!seats || isNaN(seats) || seats <= 0)) {
    return res.status(400).json({ message: "Seats required for car" });
  }
  // Validate field formats and values
  if (!["Petrol", "Diesel", "Electric", "Hybrid"].includes(fuelType)) {
    return res.status(400).json({ message: "Invalid fuel type" });
  }

  // ✅ Category validation based on type

  let allowedCategories = [];

  if (type === "Car") {
    allowedCategories = [
      "SUV",
      "Sedan",
      "Hatchback",
      "Coupe",
      "Convertible",
      "Pickup",
      "Van",
      "Crossover",
      "Minivan",
      "Roadster",
    ];
  }

  if (type === "Bike") {
    allowedCategories = [
      "Commuter",
      "Sport",
      "Naked",
      "Cruiser",
      "Touring",
      "Adventure",
      "Scooter",
      "Offroad",
      "Cafe Racer",
      "Scrambler",
      "Supermoto",
    ];
  }

  // validate
  const normalized = category.trim().toLowerCase();

  // find matching category in allowedCategories (case-insensitive)
  const matchedCategory = allowedCategories.find(
    (C) => C.toLowerCase() === normalized,
  );

  if (!matchedCategory) {
    return res.status(400).json({
      message: `Invalid category for ${type}`,
    });
  }

  category = matchedCategory;

  // Validate transmission type
  if (type === "Car" && transmission) {
    const normalized = transmission.trim().toLowerCase();

    const matched = ["Manual", "Automatic"].find(
      (t) => t.toLowerCase() === normalized,
    );

    if (!matched) {
      return res.status(400).json({ message: "Invalid transmission type" });
    }

    transmission = matched;
  }

  // Ignore transmission for bike
  if (type === "Bike") {
    transmission = undefined;
  }

  // Validate year, price, seats, mileage, features, description
  if (isNaN(year) || year < 1990) {
    return res.status(400).json({ message: "Invalid year" });
  }
  if (isNaN(pricePerDay) || pricePerDay <= 0) {
    return res
      .status(400)
      .json({ message: "Price per day must be a positive number" });
  }
  if (pricePerHour && (isNaN(pricePerHour) || pricePerHour <= 0)) {
    return res.status(400).json({ message: "Invalid price per hour" });
  }

  const vehicle = await Vehicle.create({
    name,
    brand,
    model,
    year,
    segment,
    features: features ? features.split(",") : [], // convert comma-separated string to array example: "GPS,Air Conditioning,Bluetooth" --> ["GPS", "Air Conditioning", "Bluetooth"]
    type,
    owner: userId,

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

// GET ALL VENDOR VEHICLES (FILTER + SEARCH)
export const getVendorVehivlesServices = async (query, userId) => {
  const filter = {
    owner: userId,
  };

  if (query.type) filter.type = query.type;
  if (query.approvalStatus) filter.approvalStatus = query.approvalStatus;
  if (query.status) filter.status = query.status;
  if (query.isAvailable) filter.isAvailable = query.isAvailable === "true";

  const vehicles = await Vehicle.find(filter).sort({
    createdAt: -1,
  });

  return vehicles;
};

// GET ALL VEHICLES (FILTER + SEARCH)
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

// GET SINGLE VEHICLE
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

// UPDATE VEHICLE
// Only Owner or Superadmin
export const updateVehicleService = async (req) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  if (!canManageResource(vehicle.owner, user)) {
    throw new Error("Not allowed");
  }

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
    "city",
    "state",
    "pickupAddress",
    "category",
    "description",
  ];

  const approvalFields = [
    "pricePerDay",
    "pricePerHour",
    "city",
    "fuelType",
    "category",
    "type",
    "images",
  ];

  let needsReapproval = false;

  // normal fields update
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      vehicle[field] = req.body[field];

      if (approvalFields.includes(field)) {
        needsReapproval = true;
      }
    }
  });

  // image handling
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file) => `uploads/${file.filename}`);

    // replaceImage is a flag sent from client to decide whether to replace all old images with new ones or to add new images with old ones
    const replaceImages = req.body.replaceImages === "true";

    if (replaceImages) {
      vehicle.images = newImages; // replace old images
    } else {
      vehicle.images = [...vehicle.images, ...newImages]; //add extra images
    }

    needsReapproval = true;
  }

  // moderation flow
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

// DELETE VEHICLE (BOTH VENDOR AND SUPERADMIN - SOFT DELETE - STATUS TO INACTIVE)
export const deleteVehicleService = async (vehicleId, user) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const vehicle = await Vehicle.findById(vehicleId).session(session);

    if (!vehicle) {
      throw new Error("Vehicle not found");
    }

    if (!canManageResource(vehicle.owner, user)) {
      throw new Error("Not allowed");
    }

    if (vehicle.status === "inactive") {
      throw new Error("Vehicle already inactive");
    }

    const now = new Date();

    // Block deletion if trip is ongoing
    const ongoingBooking = await Booking.exists({
      vehicle: vehicle._id,
      status: "ongoing",
      isDeleted: false,
    });

    if (ongoingBooking) {
      throw new Error("Cannot deactivate vehicle with ongoing bookings.");
    }
    // Make vehicle unavailable
    vehicle.status = "inactive";
    vehicle.isAvailable = false;

    // Cancel future pending / approved bookings
    await Booking.updateMany(
      {
        vehicle: vehicle._id,
        status: { $in: ["pending", "approved"] },
        startDate: { $gt: now },
      },
      {
        $set: {
          status: "cancelled",
          cancelledBy: user._id,
          cancelledByRole: user.role,
          cancelReason: "Vehicle unavailable",
          cancelledAt: now,
        },
      },
      { session },
    );

    // Refund future confirmed paid bookings
    const confirmedBookings = await Booking.find(
      {
        vehicle: vehicle._id,
        status: "confirmed",
        "payment.status": "paid",
        isDeleted: false,
      },
      null,
      { session },
    );

    const refundBookingIds = [];
    for (const booking of confirmedBookings) {
      booking.status = "cancelled";
      booking.cancelledBy = user._id;
      booking.cancelledByRole = user.role;
      booking.cancelReason = "Vehicle unavailable";
      booking.cancelledAt = now;

      booking.payment.status = "refund_pending";
      booking.payment.refundAmount = booking.payment.amount;

      booking.securityDeposit.status = "release_pending";
      booking.securityDeposit.refundAmount = booking.securityDeposit.amount;

      await booking.save({ session });
    }

    await vehicle.save({ session });

    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      refundBookingIds: confirmedBookings.map((booking) => booking._id),
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// RESTORE VEHICLE ( VENDOR + SUPERADMIN)
export const restoreVehicleService = async (vehicleId, user) => {
  if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
    const error = new Error("Invalid vehicle ID");
    error.statusCode = 400;
    throw error;
  }

  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    const error = new Error("Vehicle not found");
    error.statusCode = 404;
    throw error;
  }

  if (!canManageResource(vehicle.owner, user)) {
    throw new Error("Not allowed");
  }

  if (vehicle.status === "active") {
    const error = new Error("Vehicle already active");
    error.statusCode = 400;
    throw error;
  }

  if (user.role === "superadmin") {
    vehicle.status = "active";
    vehicle.isAvailable = true;
    vehicle.approvalStatus = "approved";
  } else {
    // if vendor restores, it goes to pending state and admin needs to approve again
    vehicle.status = "inactive";
    vehicle.isAvailable = false;
    vehicle.approvalStatus = "pending";
    vehicle.approvedBy = null;
    vehicle.approvedAt = null;
  }

  await vehicle.save();

  return {
    message:
      user.role === "superadmin"
        ? "Vehicle restored successfully"
        : "Vehicle sent for approval",
  };
};

// DELETE SINGLE IMAGE (BOTH VENDOR AND SUPERADMIN)
export const deleteVehicleImageService = async (req) => {
  const { imageUrl } = req.body;

  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  if (!canManageResource(vehicle.owner, req.user)) {
    throw new Error("Not allowed");
  }

  vehicle.images = vehicle.images.filter((img) => img !== imageUrl);

  await vehicle.save();

  return vehicle.images;
};

// TOGGLE AVAILABILITY
export const toggleAvailabilityService = async (vehicleId, user) => {
  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  if (!canManageResource(vehicle.owner, user)) {
    throw new Error("Not allowed");
  }

  if (vehicle.status !== "active") {
    throw new Error("Only active vehicle can change availability");
  }

  vehicle.isAvailable = !vehicle.isAvailable;

  await vehicle.save();

  return vehicle.isAvailable;
};

// GET ALL PENDING APPROVALS (SUPERADMIN ONLY)
export const getPendingApprovalsService = async () => {
  const vehicles = await Vehicle.find({ approvalStatus: "pending" }).sort({
    createdAt: -1,
  });

  return vehicles;
};

// APPROVE VEHICLE (SUPERADMIN)
export const approveVehicleService = async (vehicleId, userId) => {
  const vehicle = await Vehicle.findById(vehicleId)
    .populate("Owner")
    .select("-password");

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }
  if (!vehicle.Owner.isActive) {
    throw new Error("Vehicle owner is not active. Cannot approve vehicle.");
  }
  if (vehicle.approvalStatus !== "pending") {
    throw new Error("Only pending vehicles can be approved");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }
  if (user.role !== "superadmin") {
    throw new Error("Only superadmin can approve vehicles");
  }

  vehicle.approvalStatus = "approved";
  vehicle.status = "active";
  vehicle.isAvailable = true;
  vehicle.approvedBy = userId;
  vehicle.approvedAt = new Date();

  await vehicle.save();

  return vehicle;
};

// REJECT VEHICLE
export const rejectVehicleService = async (vehicleId, userId) => {
  const vehicle = await Vehicle.findById(vehicleId)
    .populate("Owner")
    .select("-password");

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }
  if (!vehicle.Owner.isActive) {
    throw new Error("Vehicle owner is not active. Cannot approve vehicle.");
  }
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }
  if (user.role !== "superadmin") {
    throw new Error("Only superadmin can reject vehicles");
  }

  vehicle.approvalStatus = "rejected";
  vehicle.status = "inactive";
  vehicle.isAvailable = false;
  vehicle.approvedBy = null;
  vehicle.approvedAt = null;

  await vehicle.save();

  return vehicle;
};
