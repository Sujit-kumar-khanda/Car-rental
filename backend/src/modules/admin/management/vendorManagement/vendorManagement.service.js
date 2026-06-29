export const getVendorsService = async (page = 1, limit = 10, search = "") => {
  const skip = (page - 1) * limit;

  const filter = {
    role: "admin",
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
        email: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const [vendors, total] = await Promise.all([
    User.find(filter)
      .select("name email phone isBlocked isDeleted createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    User.countDocuments(filter),
  ]);

  return {
    vendors,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getVendorByIdService = async (vendorId) => {
  const vendor = await User.findOne({
    _id: vendorId,
    role: "admin",
  }).select("name email phone isBlocked isDeleted createdAt");

  if (!vendor) {
    throw new Error("Vendor not found");
  }

  const [totalVehicles, activeVehicles, totalBookings] = await Promise.all([
    Vehicle.countDocuments({
      createdBy: vendorId,
    }),

    Vehicle.countDocuments({
      createdBy: vendorId,
      status: "active",
    }),

    Booking.countDocuments({
      owner: vendorId,
      isDeleted: false,
    }),
  ]);

  return {
    vendor,
    stats: {
      totalVehicles,
      activeVehicles,
      totalBookings,
    },
  };
};
export const getVendorDetailsService = async (vendorId) => {
  const vendor = await User.findOne({
    _id: vendorId,
    role: "admin",
  }).select("name email phone profileImage isBlocked isDeleted createdAt");

  if (!vendor) {
    throw new Error("Vendor not found");
  }

  const [totalVehicles, activeVehicles, inactiveVehicles] = await Promise.all([
    Vehicle.countDocuments({
      createdBy: vendorId,
      isDeleted: false,
    }),

    Vehicle.countDocuments({
      createdBy: vendorId,
      status: "active",
      isDeleted: false,
    }),

    Vehicle.countDocuments({
      createdBy: vendorId,
      status: "inactive",
      isDeleted: false,
    }),
  ]);

  const vehicles = await Vehicle.find({
    createdBy: vendorId,
    isDeleted: false,
  }).select("_id rating");

  const vehicleIds = vehicles.map((vehicle) => vehicle._id);

  const [totalBookings, completedBookings, cancelledBookings] =
    await Promise.all([
      Booking.countDocuments({
        vehicle: {
          $in: vehicleIds,
        },
        isDeleted: false,
      }),

      Booking.countDocuments({
        vehicle: {
          $in: vehicleIds,
        },
        status: "completed",
        isDeleted: false,
      }),

      Booking.countDocuments({
        vehicle: {
          $in: vehicleIds,
        },
        status: "cancelled",
        isDeleted: false,
      }),
    ]);

  const revenueResult = await Booking.aggregate([
    {
      $match: {
        vehicle: {
          $in: vehicleIds,
        },
        status: {
          $in: ["confirmed", "ongoing", "completed"],
        },
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: null,
        revenue: {
          $sum: "$pricePaidByCustomer",
        },
      },
    },
  ]);

  const totalRevenue = revenueResult[0]?.revenue || 0;

  const averageVehicleRating =
    vehicles.length === 0
      ? 0
      : vehicles.reduce((sum, vehicle) => sum + (vehicle.rating || 0), 0) /
        vehicles.length;

  return {
    vendor,

    stats: {
      totalVehicles,
      activeVehicles,
      inactiveVehicles,

      totalBookings,
      completedBookings,
      cancelledBookings,

      totalRevenue,

      averageVehicleRating: Number(averageVehicleRating.toFixed(1)),
    },
  };
};

export const blockVendorService = async (vendorId, superadminId) => {
  const vendor = await User.findOne({
    _id: vendorId,
    role: "admin",
  });

  if (!vendor) {
    throw new Error("Vendor not found");
  } 

  const vehicle = await Vehicle.find({
    owner: vendorId,
    isDeleted: false,
  });

  const vehicleIds = vehicle.map((v) => v._id);

  const activeBookings = await Booking.exists({
    vehicle: { $in: vehicleIds },
    status: {
      $in: [ "confirmed", "ongoing"],
    },
    isDeleted: false,
  });

  if (activeBookings) {
    throw new Error("Cannot block vendor with active bookings.");
  }

  vendor.isActive = !vendor.isActive;

  await vendor.save();

  await Vehicle.updateMany(
    { owner: vendorId },
    {
      $set: {
        status: "inactive",
        isAvailable: false,
      },
    },
  );

  await Booking.updateMany(
    {
      vehicle: { $in: vehicleIds },
      status: { $in: ["pending", "approved"] },
      isDeleted: false,
    },
    {
      $set: {
        status: "cancelled",
        cancelledBy: superadminId, // user who performed the action
        cancelledByRole: "superadmin",
        cancelledAt: new Date(),
        cancelReason: "Vendor account has been blocked by the platform.",
      },
    },
  );

  return true;
};

export const unblockVendorService = async (vendorId) => {
  const vendor = await User.findOne({
    _id: vendorId,
    role: "admin",
  });

  if (!vendor) {
    throw new Error("Vendor not found");
  }

  vendor.isActive = !vendor.isActive;

  await vendor.save();
  await Vehicle.updateMany(
    { owner: vendorId },
    {
      $set: {
        status: "active",
        isAvailable: true,
      },
    },
  );

  return true;
};

export const deleteVendorService = async (vendorId, ) => {
  const vendor = await User.findOne({
    _id: vendorId,
    role: "admin",
  });

  if (!vendor) {
    throw new Error("Vendor not found");
  }

  const vehicles = await Vehicle.find({
    owner: vendorId,
    isDeleted: false,
  });

  const vehicleIds = vehicles.map((v) => v._id);

  const activeBookings = await Booking.exists({
    vehicle: { $in: vehicleIds },
    status: {
      $in: ["pending", "approved", "confirmed", "ongoing"],
    },
    isDeleted: false,
  });

  if (activeBookings) {
    throw new Error("Cannot delete vendor with active bookings.");
  }

  vendor.isActive = !vendor.isActive;
  

  await vendor.save();

  await Vehicle.updateMany(
    { owner: vendorId },
    {
      $set: {
        status: "inactive",
        isAvailable: false,
      },
    },
  );

  return true;
};

export const restoreVendorService = async (vendorId) => {
  const vendor = await User.findOne({
    _id: vendorId,
    role: "admin",
  });

  if (!vendor) {
    throw new Error("Vendor not found");
  }

  vendor.isActive = !vendor.isActive;

  await vendor.save();

   await Vehicle.updateMany(
    { owner: vendorId },
    {
      $set: {
        status: "active",
        isAvailable: true,
      },
    },
  );


  return true;
};
