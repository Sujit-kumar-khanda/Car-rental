import * as vehicleService from "./vehicle.service.js";

// ADD VEHICLE (VENDOR ONLY)
export const addVehicle = async (req, res) => {
  try {
    const vehicle = await vehicleService.addVehicleService(
      req.body,
      req.files,
      req.user,
    );

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

// GET VENDOR VEHICLES
export const getVendorVehicles = async (req, res ) => {
  try{
    const vehicles = await vehicleService.getVendorVehiclesService(req.query, req.user.id);

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

// GET ALL VEHICLES (FOR EVERYONE )
export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleService.getAllVehiclesService(req.query);

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

// GET SINGLE ( FOR EVERYONE - DETAILED VIEW)
export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await vehicleService.getVehicleByIdService(req.params.id);

    res.status(200).json({
      success: true,
      vehicle,
    });
  } catch (error) {
    res.status(error.message === "Vehicle not found" ? 404 : 400).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE (VENDOR)
export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await vehicleService.updateVehicleService(req);

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      vehicle,
    });
  } catch (error) {
    res.status(error.message === "Vehicle not found" ? 404 : 400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE / INACTIVE
export const deleteVehicle = async (req, res) => {
  try {
    await vehicleService.deleteVehicleService(req.params.id, req.user);

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    res.status(error.message === "Vehicle not found" ? 404 : 400).json({
      success: false,
      message: error.message,
    });
  }
};

// RESTORE VEHICLE ( VENDOR + SUPERADMIN)
export const restoreVehicle = async (req, res) => {
  try {
    const result = await vehicleService.restoreVehicleService(
      req.params.id,
      req.user,
    );

    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

// DELETE IMAGE
export const deleteVehicleImage = async (req, res) => {
  try {
    const images = await vehicleService.deleteVehicleImageService(req);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      images,
    });
  } catch (error) {
    res.status(error.message === "Vehicle not found" ? 404 : 400).json({
      success: false,
      message: error.message,
    });
  }
};

// TOGGLE AVAILABILITY
export const toggleAvailability = async (req, res) => {
  try {
    const isAvailable = await vehicleService.toggleAvailabilityService(
      req.params.id,
      req.user,
    );

    res.status(200).json({
      success: true,
      message: "Vehicle availability updated",
      isAvailable,
    });
  } catch (error) {
    res.status(error.message === "Vehicle not found" ? 404 : 400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL PENDING APPROVALS (SUPERADMIN ONLY)
export const getPendingApprovals = async (req, res) => {
  try {
    const vehicles = await vehicleService.getPendingApprovalsService();

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

// APPROVE VEHICLE (SUPERADMIN ONLY)
export const approveVehicle = async (req, res) => {
  try {
    const vehicle = await vehicleService.approveVehicleService(
      req.params.id,
      req.user._id,
    );

    res.status(200).json({
      success: true,
      message: "Vehicle approved successfully",
      vehicle,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// REJECT VEHICLE (SUPERADMIN ONLY)
export const rejectVehicle = async (req, res) => {
  try {
    const vehicle = await vehicleService.rejectVehicleService(
      req.params.id,
      req.user._id,
    );

    res.status(200).json({
      success: true,
      message: "Vehicle rejected successfully",
      vehicle,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
