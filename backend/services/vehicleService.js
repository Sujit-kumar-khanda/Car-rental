import Vehicle from "../models/vehicleModel.js";

// Add Vehicle
export const addVehicleService = async (req) => {
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
    color,
    city,
    state,
    pickupAddress,
    description,
    category,
    segment,
    features,
    securityDeposit,
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
    !city ||
    !category
  ) {
    throw new Error("Please fill in all required fields");
  }

  // seat is required for cars but not for bikes
  if (type === "Car" && (!seats || isNaN(seats) || seats <= 0)) {
    throw new Error("Seats required for car");
  }

  // Validate field formats and values
  if (!["Petrol", "Diesel", "Electric", "Hybrid"].includes(fuelType)) {
    throw new Error("Invalid fuel type");
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
    (c) => c.toLowerCase() === normalized,
  );

  if (!matchedCategory) {
    throw new Error(`Invalid category for ${type}`);
  }

  category = matchedCategory;

  // Validate transmission type
  if (type === "Car" && transmission) {
    const normalizedTransmission = transmission.trim().toLowerCase();

    const matched = ["Manual", "Automatic"].find(
      (t) => t.toLowerCase() === normalizedTransmission,
    );

    if (!matched) {
      throw new Error("Invalid transmission type");
    }

    transmission = matched;
  }

  // Ignore transmission for bike
  if (type === "Bike") {
    transmission = undefined;
  }

  // Validate year, price, seats, mileage, features, description
  if (isNaN(year) || year < 1886 || year > new Date().getFullYear() + 1) {
    throw new Error("Invalid year");
  }

  if (isNaN(pricePerDay) || pricePerDay <= 0) {
    throw new Error("Price per day must be a positive number");
  }

  if (pricePerHour && (isNaN(pricePerHour) || pricePerHour <= 0)) {
    throw new Error("Invalid price per hour");
  }

  if (mileage && typeof mileage !== "string") {
    throw new Error("Mileage must be a string (e.g. '18 km/l')");
  }

  if (features && typeof features !== "string") {
    throw new Error(
      "Features must be a comma-separated string (e.g. 'GPS,Air Conditioning,Bluetooth')",
    );
  }

  if (description && typeof description !== "string") {
    throw new Error("Description must be a string");
  }

  // SAME DB QUERY AS PREVIOUS
  return await Vehicle.create({
    name,
    brand,
    model,
    year,
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
    city,
    state,
    pickupAddress,
    description,
    category,
    segment,
    features: features ? features.split(",") : [], // convert comma-separated string to array example: "GPS,Air Conditioning,Bluetooth" --> ["GPS", "Air Conditioning", "Bluetooth"]
    images,
  });
};

// Get All Vehicles (Public)
export const getAllVehiclesService = async () => {
  return await Vehicle.find({ isAvailable: true, approvalStatus: "approved" });
};

// Get Vehicle by ID (Public)
export const getVehicleByIdService = async (id) => {
  return await Vehicle.findById(id);
};

// Update Vehicle
export const updateVehicleService = async (req) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    throw new Error("Vehicle not found");
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
    const replaceImages = req.body.replaceImages === "true";

    // if true, replace old images with new ones; if false, add new images to existing ones
    if (replaceImages) {
      // replace old images
      vehicle.images = newImages;
    } else {
      // add extra images
      vehicle.images = [...vehicle.images, ...newImages];
    }
  }

  await vehicle.save();

  return vehicle;
};

// Delete Entire Vehicle
export const deleteVehicleService = async (id) => {
  const vehicle = await Vehicle.findById(id);

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  await vehicle.deleteOne(); // delete the entire vehicle document from the database
};

// Delete Specific Vehicle Image
export const deleteVehicleImageService = async (req) => {
  const { image } = req.body; // image path to delete .it is not a file.path but a string in the images array of the vehicle document (e.g. "uploads/vehicle1.jpg")


  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  // ❌ remove specific image from array
  vehicle.images = vehicle.images.filter((img) => img !== image);

  await vehicle.save();

  return vehicle.images;
};

// Toggle Vehicle Availability
export const toggleAvailabilityService = async (id) => {
  const vehicle = await Vehicle.findById(id);

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  vehicle.isAvailable = !vehicle.isAvailable;

  await vehicle.save();

  return vehicle.isAvailable;
};

