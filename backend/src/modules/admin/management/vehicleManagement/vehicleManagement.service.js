
import Vehicle from "../../../vehicles/vehicle.model.js";

// GET ALL VEHICLES with status filter
export const getVehiclesService = async (page = 1, limit = 10, search = "", status = "") => {
  const skip = (page - 1) * limit;

  const filter = {
    isDeleted: false,
  };

  if (search) {
    filter.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        brand: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  if (status) {
    filter.status = status;
  }

  const [vehicles, total] = await Promise.all([
    Vehicle
      .find(filter)
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Vehicle.countDocuments(filter),
  ]);

  return {
    vehicles,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// VEHICLE DETAILS
export const getVehicleDetailsService = async (vehicleId) => {
  const vehicle = await Vehicle.findById(vehicleId).populate(
    "owner",
    "name email phone",
  );

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  const [totalBookings, completedBookings, cancelledBookings, ongoingBookings] =
    await Promise.all([
      Booking.countDocuments({
        vehicle: vehicleId,
        isDeleted: false,
      }),

      Booking.countDocuments({
        vehicle: vehicleId,
        status: "completed",
        isDeleted: false,
      }),

      Booking.countDocuments({
        vehicle: vehicleId,
        status: "cancelled",
        isDeleted: false,
      }),

      Booking.countDocuments({
        vehicle: vehicleId,
        status: "ongoing",
        isDeleted: false,
      }),
    ]);

  return {
    vehicle,
    stats: {
      totalBookings,
      completedBookings,
      cancelledBookings,
      ongoingBookings,
      rating: vehicle.rating,
      totalReviews: vehicle.totalReviews,
    },
  };
};



// APPROVE VEHICLE
export const approveVehicleService = async (vehicleId, superadminId) => {
  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  if (vehicle.approvalStatus === "approved") {
    throw new Error("Vehicle already approved");
  }

  vehicle.approvalStatus = "approved";

  vehicle.status = "active";

  vehicle.approvedAt = new Date();

  vehicle.approvedBy = superadminId;

  vehicle.isAvailable = true;

  vehicle.rejectionReason = null;

  vehicle.rejectedAt = null;

  vehicle.rejectedBy = null;

  await vehicle.save();

  await createNotificationService({
    user: vehicle.owner,
    title: "Vehicle Approved",
    message: `${vehicle.name} has been approved.`,
    type: "vehicle",
    referenceId: vehicle._id,
  });

  return vehicle;
};

// REJECT
export const rejectVehicleService = async (vehicleId, reason, superadminId) => {
  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  vehicle.approvalStatus = "rejected";

  vehicle.rejectionReason = reason;

  vehicle.rejectedAt = new Date();

  vehicle.rejectedBy = superadminId;

  vehicle.status = "inactive";

  vehicle.isAvailable = false;

  vehicle.approvedBy = null;

  vehicle.approvedAt = null;

  await vehicle.save();

  await createNotificationService({
    user: vehicle.owner,
    title: "Vehicle Rejected",
    message: reason,
    type: "vehicle",
    referenceId: vehicle._id,
  });

  return vehicle;
};
