import {
  addVehicleService,
  getAllVehiclesService,
  getVehicleByIdService,
  updateVehicleService,
  deleteVehicleService,
  deleteVehicleImageService,
  toggleAvailabilityService,
} from "../services/vehicleService.js";

// ADD VEHICLE
export const addVehicle = async (req, res) => {
  try {
    const vehicle = await addVehicleService(req);

    res.status(201).json({
      success: true,
      message: "Vehicle added successfully",
      vehicle,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL
export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await getAllVehiclesService(req.query);

    res.status(200).json({
      success: true,
      vehicles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE
export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await getVehicleByIdService(req.params.id);

    res.status(200).json({
      success: true,
      vehicle,
    });
  } catch (error) {
    res.status(
      error.message === "Vehicle not found" ? 404 : 400
    ).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE
export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await updateVehicleService(req);

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      vehicle,
    });
  } catch (error) {
    res.status(
      error.message === "Vehicle not found" ? 404 : 400
    ).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE / INACTIVE
export const deleteVehicle = async (req, res) => {
  try {
    await deleteVehicleService(req.params.id, req.user);

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    res.status(
      error.message === "Vehicle not found" ? 404 : 400
    ).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE IMAGE
export const deleteVehicleImage = async (req, res) => {
  try {
    const images = await deleteVehicleImageService(req);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      images,
    });
  } catch (error) {
    res.status(
      error.message === "Vehicle not found" ? 404 : 400
    ).json({
      success: false,
      message: error.message,
    });
  }
};

// TOGGLE AVAILABILITY
export const toggleAvailability = async (req, res) => {
  try {
    const isAvailable = await toggleAvailabilityService(
      req.params.id,
      req.user
    );

    res.status(200).json({
      success: true,
      message: "Vehicle availability updated",
      isAvailable,
    });
  } catch (error) {
    res.status(
      error.message === "Vehicle not found" ? 404 : 400
    ).json({
      success: false,
      message: error.message,
    });
  }
};