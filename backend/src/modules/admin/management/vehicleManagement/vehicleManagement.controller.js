import * as vendorManagementService from "./vehicleManagement.service.js";


export const getVehicles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;

    const limit = parseInt(req.query.limit) || 10;

    const search = req.query.search || "";

    const status = req.query.status || "";

    const result = await vendorManagementService.getVehiclesService(page, limit, search, status);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getVehicleDetails = async (req, res, next) => {
  try {
    const result = await vendorManagementService.getVehicleDetailsService(req.params.vehicleId);

    return res.status(200).json({
      success: true,
      message: "Vehicle details fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};



export const approveVehicle = async (req, res, next) => {
  try {
    await vendorManagementService.approveVehicleService(req.params.vehicleId, req.user.id);

    res.status(200).json({
      success: true,
      message: "Vehicle approved successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const rejectVehicle = async (req, res, next) => {
  try {
    const { reason } = req.body;

    await vendorManagementService.rejectVehicleService(req.params.vehicleId, reason, req.user.id);

    res.status(200).json({
      success: true,
      message: "Vehicle rejected successfully",
    });
  } catch (error) {
    next(error);
  }
};
