import User from "../models/userModel.js";
import Vehicle from "../models/vechileModel.js";
import mongoose from "mongoose";

//  Add Vehicle (Admin Only)
export const addVehicle = async (req, res) => {
  try {
    let {
      name,
      brand,
      model,
      year,
      type,
      pricePerDay,
      pricePerHour,
      fuelType,
      transmission,
      seats,
      mileage,
      location,
      description,
      category,
      segment,
      features,
    } = req.body;

    const images = req.files
      ? req.files.map((file) => `uploads/${file.filename}`)
      : []; // Handle multiple image uploads

    // Validate required fields
    if (
      !name ||
      !brand ||
      !year ||
      !type ||
      !pricePerDay ||
      !fuelType ||
      !location ||
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
    if (isNaN(year) || year < 1886 || year > new Date().getFullYear() + 1) {
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

    if (mileage && typeof mileage !== "string") {
      return res
        .status(400)
        .json({ message: "Mileage must be a string (e.g. '18 km/l')" });
    }
    if (features && typeof features !== "string") {
      return res.status(400).json({
        message:
          "Features must be a comma-separated string (e.g. 'GPS,Air Conditioning,Bluetooth')",
      });
    }
    if (description && typeof description !== "string") {
      return res.status(400).json({ message: "Description must be a string" });
    }

    const vehicle = await Vehicle.create({
      name,
      brand,
      model,
      year,
      type,
      pricePerDay,
      pricePerHour,
      fuelType,
      transmission,
      seats,
      mileage,
      location,
      description,
      category,
      segment,
      features: features ? features.split(",") : [], // convert comma-separated string to array example: "GPS,Air Conditioning,Bluetooth" --> ["GPS", "Air Conditioning", "Bluetooth"]
      images,
      createdBy: req.user.id,
    });

    res.status(201).json({
      message: "Vehicle added successfully",
      vehicle,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get All Vehicles (Public)
export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ status: "active" }); // Only return available vehicles for listing

    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Vehicles (admin only)
export const getAllVendorVehicles = async (req, res) => {
  try {
    const { type } = req.query;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build filter dynamically
    let filter = { createdBy: user._id };

    if (type) {
      filter.type = type; // Car or Bike
    }

    const vehicles = await Vehicle.find(filter);

    if (vehicles.length === 0) {
      return res.status(404).json({ message: "No vehicles found" });
    }

    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Vehicle by ID (Public)
export const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    //Check valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid vehicle ID" });
    }

    const vehicle = await Vehicle.findById(id);

    if (!vehicle || vehicle.status === "inactive") {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Vehicle (Admin Only)
export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    Object.assign(vehicle, req.body); // Update vehicle fields with request body (only provided fields will be updated)

    // 🖼️ handle images separately (Multer)
    if (req.files && req.files.length > 0) {
      // if new images are uploaded
      const newImages = req.files.map(
        // convert uploaded files to image URLs
        (file) => `uploads/${file.filename}`,
      );

      // 🔥 check admin choice
      const replaceImages = req.body.replaceImages === "true"; // replaceImages is a string come from fronted form and has boolean value (true or false)

      // if true, replace old images with new ones; if false, add new images to existing ones
      if (replaceImages) {
        // replace old images
        vehicle.images = newImages; // old images will be removed and replaced with new images
      } else {
        // add extra images
        vehicle.images = [...vehicle.images, ...newImages]; // old images will be kept and new images will be added to the existing array of images
      }
    }

    await vehicle.save();

    res.json({
      message: "Vehicle updated successfully",
      vehicle,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Vehicle (Admin and Superadmin)
export const deleteVehicle = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid vehicle ID" });
    }

    await session.withTransaction(async () => {
      const vehicle = await Vehicle.findById(id).session(session);

      if (!vehicle) {
        throw new Error("Vehicle not found");
      }

      if (vehicle.status === "inactive") {
        throw new Error("Vehicle already inactive");
      }

      const isSuperAdmin = req.user.role === "superadmin";
      const isOwner = vehicle.createdBy.toString() === req.user._id.toString();

      if (!isSuperAdmin && !isOwner) {
        return res.status(403).json({ message: "Not allowed" });
      }

      // Mark vehicle inactive
      vehicle.status = "inactive";
      await vehicle.save({ session });

      const now = new Date();

      // Refund confirmed future bookings
      await Booking.updateMany(
        {
          vehicle: vehicle._id,
          status: "confirmed",
          "payment.status": "paid",
          startDate: { $gt: now },
        },
        {
          $set: {
            status: "cancelled",
            cancelReason: "Vehicle unavailable",
            cancelledAt: now,
            "payment.status": "refunded",
            "payment.refundedAt": now,
          },
        },
        { session },
      );

      // 🚨 2. Cancel future bookings
      await Booking.updateMany(
        {
          vehicle: vehicle._id,
          status: { $in: ["pending", "approved"] },
          startDate: { $gt: now },
        },
        {
          $set: {
            status: "cancelled",
            cancelReason: "Vehicle marked unavailable",
            cancelledAt: now,
          },
        },
        { session },
      );

      // Cancel ongoing (no refund)
      await Booking.updateMany(
        {
          vehicle: vehicle._id,
          status: "ongoing",
        },
        {
          $set: {
            status: "interrupted", // new status
            cancelReason: "Vehicle became unavailable during trip",
            cancelledAt: now,
          },
        },
        { session },
      );
    });

    res.json({ message: "Vehicle marked as unavailable" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// Restore Vehicle (admin nad Superadmin Only)
export const restoreVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid vehicle ID" });
    }

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(400).json({ message: "Vehicle not Found" });
    }

    const isSuperAdmin = req.user.role === "superadmin";
    const isOwner = vehicle.createdBy.toString() === req.user._id.toString();

    if (!isSuperAdmin && !isOwner) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (vehicle.status === "active") {
      return res.status(400).json({ message: "Vehicle already active" });
    }

    vehicle.status = "active";
    await vehicle.save();

    res.json({ message: "Vehicle Restored Successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Specific Vehicle Image (Admin Only)
export const deleteVehicleImage = async (req, res) => {
  try {
    const { image } = req.body; // image path to delete .it is not a file.path but a string in the images array of the vehicle document (e.g. "uploads/vehicle1.jpg")

    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // ❌ remove specific image from array
    vehicle.images = vehicle.images.filter((img) => img !== image);

    await vehicle.save();

    res.json({
      message: "Image deleted successfully",
      images: vehicle.images,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle Vehicle Availability (Admin Only)
export const toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid vehicle ID" });
    }

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // 🔐 Authorization
    const isSuperAdmin = req.user.role === "superadmin";
    const isOwner = vehicle.createdBy.toString() === req.user._id.toString();

    if (!isSuperAdmin && !isOwner) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // Prevent enabling inactive vehicle
    if (vehicle.status === "inactive") {
      return res.status(400).json({
        message: "Inactive vehicle cannot be made available",
      });
    }

    const now = new Date();

    if (!vehicle.isAvailable) {
      const conflict = await Booking.findOne({
        vehicle: vehicle._id,
        status: { $in: ["confirmed", "ongoing"] },
        startDate: { $lte: now },
        endDate: { $gte: now },
      });

      if (conflict) {
        return res.status(400).json({
          message: "Vehicle is currently booked or in use",
        });
      }
    }

    // Toggle
    vehicle.isAvailable = !vehicle.isAvailable;
    await vehicle.save();

    res.json({
      message: "Vehicle availability updated",
      isAvailable: vehicle.isAvailable,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
