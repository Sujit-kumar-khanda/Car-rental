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

// Delete Vehicle (Admin and Superadmin)
export const deleteVehicle = async (req, res) => {
  try {
    await deleteVehicleService(req.params.id);

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