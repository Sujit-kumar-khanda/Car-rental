import Vehicle from "../models/vechileModel.js";

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
    const vehicles = await Vehicle.find({ isAvailable: true }); // Only return available vehicles for listing

    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Vehicle by ID (Public)
export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
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

// Delete Entire Vehicle (Admin Only)
export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    await vehicle.deleteOne(); // delete the entire vehicle document from the database

    res.json({
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

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
