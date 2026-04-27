import {
  addVehicleService,
  getAllVehiclesService,
  getVehicleByIdService,
  updateVehicleService,
  deleteVehicleService,
  deleteVehicleImageService,
  toggleAvailabilityService,
} from "../services/vehicleService.js";

// Add Vehicle (Admin Only)
export const addVehicle = async (req, res) => {
  try {
    const vehicle = await addVehicleService(req);

    res.status(201).json({
      message: "Vehicle added successfully",
      vehicle,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get All Vehicles (Public)
export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await getAllVehiclesService();

    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Vehicle by ID (Public)
export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await getVehicleByIdService(req.params.id);

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
    const vehicle = await updateVehicleService(req);

    res.json({
      message: "Vehicle updated successfully",
      vehicle,
    });
  } catch (error) {
    res.status(
      error.message === "Vehicle not found" ? 404 : 400,
    ).json({ message: error.message });
  }
};

// Delete Entire Vehicle (Admin Only)
export const deleteVehicle = async (req, res) => {
  try {
    await deleteVehicleService(req.params.id);

    res.json({
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    res.status(
      error.message === "Vehicle not found" ? 404 : 400,
    ).json({ message: error.message });
  }
};

// Delete Specific Vehicle Image (Admin Only)
export const deleteVehicleImage = async (req, res) => {
  try {
    const images = await deleteVehicleImageService(req);

    res.json({
      message: "Image deleted successfully",
      images,
    });
  } catch (error) {
    res.status(
      error.message === "Vehicle not found" ? 404 : 400,
    ).json({ message: error.message });
  }
};

// Toggle Vehicle Availability (Admin Only)
export const toggleAvailability = async (req, res) => {
  try {
    const isAvailable = await toggleAvailabilityService(req.params.id);

    res.json({
      message: "Vehicle availability updated",
      isAvailable,
    });
  } catch (error) {
    res.status(
      error.message === "Vehicle not found" ? 404 : 400,
    ).json({ message: error.message });
  }
};