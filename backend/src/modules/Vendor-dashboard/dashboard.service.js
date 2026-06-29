import Vehicle from "../vehicles/vehicle.model.js";
import Booking from "../bookings/booking.model.js";

export const getVendorVehicleStatsService = async (vendorId) => {
  // get vendor vehicles
  const vehicles = await Vehicle.find({
    owner: vendorId,
    isDeleted: false,
  }).select("_id name brand model");

  // extract vehicle IDs
  const vehicleIds = vehicles.map((v) => v._id);

  // aggregate booking stats
  const stats = await Booking.aggregate([
    // processes documents and calculates data.

    // match vehicles including vehicleIds and not deleted
    {
      $match: {
        vehicle: {
          $in: vehicleIds,
        },
        isDeleted: false,
      },
    },

    // Group all bookings by vehicle id and calculate stats for each vehicle
    {
      $group: {
        _id: "$vehicle", //It comes from your Booking schema.

        // for every booking add 1 to totalBookings
        totalBookings: {
          $sum: 1,
        },

        pendingBookings: {
          $sum: {
            $cond: [
              {
                $eq: ["$status", "pending"],
              },
              1,
              0,
            ],
          },
        },

        completedBookings: {
          //if status is completed add 1 else add 0
          $sum: {
            $cond: [
              {
                $eq: ["$status", "completed"],
              },
              1,
              0,
            ],
          },
        },

        cancelledBookings: {
          //if status is cancelled add 1 else add 0
          $sum: {
            $cond: [
              {
                $eq: ["$status", "cancelled"],
              },
              1,
              0,
            ],
          },
        },

        activeBookings: {
          //if status is confirmed or ongoing add 1 else add 0
          $sum: {
            $cond: [
              {
                $in: ["$status", ["confirmed", "ongoing"]],
              },
              1,
              0,
            ],
          },
        },

        // sum of finalPrice for all bookings of the vehicle
        totalRevenue: {
          $sum: {
            $cond: [
              {
                $eq: ["$status", "completed"],
              },
              "$finalPrice",
              0,
            ],
          },
        },
      },
    },
  ]);

  // merge vehicle info with stats
  const result = vehicles.map((vehicle) => {
    const vehicleStat = stats.find(
      (s) => s._id.toString() === vehicle._id.toString(),
    );

    return {
      vehicleId: vehicle._id,

      vehicleName: vehicle.name,

      brand: vehicle.brand,

      model: vehicle.model,

      totalBookings: vehicleStat?.totalBookings || 0,

      pendingBookings: vehicleStat?.pendingBookings || 0,

      completedBookings: vehicleStat?.completedBookings || 0,

      cancelledBookings: vehicleStat?.cancelledBookings || 0,

      activeBookings: vehicleStat?.activeBookings || 0,

      totalRevenue: vehicleStat?.totalRevenue || 0,
    };
  });

  return result;
};

// dashboard Overview for vendor
export const getVendorOverviewService = async (vendorId) => {
  // VEHICLE STATS

  const totalVehicles = await Vehicle.countDocuments({
    // countDocuments counts the no. of matching documents in the collection.
    owner: vendorId,
    isDeleted: false,
  });

  const activeVehicles = await Vehicle.countDocuments({
    owner: vendorId,
    status: "active",
    isDeleted: false,
  });

  const inactiveVehicles = await Vehicle.countDocuments({
    owner: vendorId,
    status: "inactive",
    isDeleted: false,
  });

  // get vendor vehicle ids
  const vehicles = await Vehicle.find({
    owner: vendorId,
    isDeleted: false,
  }).select("_id");

  // extract vehicle IDs
  const vehicleIds = vehicles.map((v) => v._id);

  // BOOKING ANALYTICS

  const bookingStats = await Booking.aggregate([
    {
      $match: {
        vehicle: {
          $in: vehicleIds,
        },
        isDeleted: false,
      },
    },

    // Put ALL documents into ONE single group
    {
      $group: {
        _id: null,

        totalBookings: {
          $sum: 1,
        },

        pendingBookings: {
          $sum: {
            $cond: [
              {
                $eq: ["$status", "pending"],
              },
              1,
              0,
            ],
          },
        },

        activeBookings: {
          $sum: {
            $cond: [
              {
                $in: ["$status", ["confirmed", "ongoing"]],
              },
              1,
              0,
            ],
          },
        },

        completedBookings: {
          $sum: {
            $cond: [
              {
                $eq: ["$status", "completed"],
              },
              1,
              0,
            ],
          },
        },

        cancelledBookings: {
          $sum: {
            $cond: [
              {
                $eq: ["$status", "cancelled"],
              },
              1,
              0,
            ],
          },
        },

        totalRevenue: {
          $sum: {
            $cond: [
              {
                $eq: ["$status", "completed"],
              },
              "$finalPrice",
              0,
            ],
          },
        },
      },
    },
  ]);

  const stats = bookingStats[0] || {};

  return {
    totalVehicles,

    activeVehicles,

    inactiveVehicles,

    totalBookings: stats.totalBookings || 0,

    pendingBookings: stats.pendingBookings || 0,

    activeBookings: stats.activeBookings || 0,

    completedBookings: stats.completedBookings || 0,

    cancelledBookings: stats.cancelledBookings || 0,

    totalRevenue: stats.totalRevenue || 0,
  };
};

// Revenue analytics for vendor
export const getVendorRevenueAnalyticsService = async (
  vendorId,
  filter = "monthly",
) => {
  // GET VENDOR VEHICLES

  const vehicles = await Vehicle.find({
    owner: vendorId,
    isDeleted: false,
  }).select("_id");

  const vehicleIds = vehicles.map((v) => v._id);

  // GROUP FORMAT

  let groupId = {};

  if (filter === "daily") {
    groupId = {
      year: {
        $year: "$createdAt",
      },
      month: {
        $month: "$createdAt",
      },
      day: {
        $dayOfMonth: "$createdAt",
      },
    };
  } else if (filter === "yearly") {
    groupId = {
      year: {
        $year: "$createdAt",
      },
    };
  } else {
    // monthly default
    groupId = {
      year: {
        $year: "$createdAt",
      },
      month: {
        $month: "$createdAt",
      },
    };
  }

  // AGGREGATION

  const revenue = await Booking.aggregate([
    {
      $match: {
        vehicle: {
          $in: vehicleIds,
        },

        isDeleted: false,

        status: "completed",
      },
    },

    {
      $group: {
        _id: groupId,

        totalRevenue: {
          $sum: "$finalPrice",
        },

        totalBookings: {
          $sum: 1,
        },
      },
    },

    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
        "_id.day": 1,
      },
    },
  ]);

  return revenue;
};

//booking trends

export const getVendorBookingTrendsService = async (
  vendorId,
  filter = "monthly",
) => {
  // GET VENDOR VEHICLES

  const vehicles = await Vehicle.find({
    owner: vendorId,
    isDeleted: false,
  }).select("_id");

  const vehicleIds = vehicles.map((v) => v._id);

  // GROUP FORMAT

  let groupId = {};

  if (filter === "daily") {
    groupId = {
      year: {
        $year: "$createdAt",
      },
      month: {
        $month: "$createdAt",
      },
      day: {
        $dayOfMonth: "$createdAt",
      },
    };
  } else if (filter === "yearly") {
    groupId = {
      year: {
        $year: "$createdAt",
      },
    };
  } else {
    // monthly default
    groupId = {
      year: {
        $year: "$createdAt",
      },
      month: {
        $month: "$createdAt",
      },
    };
  }

  // AGGREGATION

  const trends = await Booking.aggregate([
    {
      $match: {
        vehicle: {
          $in: vehicleIds,
        },

        isDeleted: false,
      },
    },

    {
      $group: {
        _id: groupId,

        totalBookings: {
          $sum: 1,
        },

        pendingBookings: {
          $sum: {
            $cond: [
              {
                $eq: ["$status", "pending"],
              },
              1,
              0,
            ],
          },
        },

        confirmedBookings: {
          $sum: {
            $cond: [
              {
                $eq: ["$status", "confirmed"],
              },
              1,
              0,
            ],
          },
        },

        completedBookings: {
          $sum: {
            $cond: [
              {
                $eq: ["$status", "completed"],
              },
              1,
              0,
            ],
          },
        },

        cancelledBookings: {
          $sum: {
            $cond: [
              {
                $eq: ["$status", "cancelled"],
              },
              1,
              0,
            ],
          },
        },
      },
    },

    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
        "_id.day": 1,
      },
    },
  ]);

  return trends;
};

export const getTopPerformingVehiclesService = async (vendorId, limit = 5) => {
  // =========================
  // GET VENDOR VEHICLES
  // =========================

  const vehicles = await Vehicle.find({
    owner: vendorId,
    isDeleted: false,
  }).select("_id");

  const vehicleIds = vehicles.map((v) => v._id);

  const topVehicles = await Booking.aggregate([
    {
      $match: {
        vehicle: {
          // this field is from booking schema which references vehicle collection
          $in: vehicleIds,
        },

        isDeleted: false,
      },
    },

    {
      $group: {
        _id: "$vehicle", // from booking schema vehicle field which references vehicle collection

        totalBookings: {
          $sum: 1,
        },

        completedBookings: {
          $sum: {
            $cond: [
              {
                $eq: ["$status", "completed"],
              },
              1,
              0,
            ],
          },
        },

        totalRevenue: {
          $sum: {
            $cond: [
              {
                $eq: ["$status", "completed"],
              },
              "$finalPrice",
              0,
            ],
          },
        },
      },
    },

    // highest revenue first
    {
      $sort: {
        totalRevenue: -1,
      },
    },

    // limit results
    {
      $limit: Number(limit),
    },

    // join vehicle details
    {
      $lookup: {
        // Join another collection
        from: "vehicles", // Take data from vehicles collection from MongoDB
        localField: "_id", // Use current aggregation _id which is vehicle id
        foreignField: "_id", // Match with Vehicle collection _id
        as: "vehicle", // Store joined result inside vehicle field
      },
    },

    // unwind vehicle array to object since lookup returns an array
    {
      $unwind: "$vehicle",
    },

    // final fields
    {
      $project: {
        _id: 0,

        vehicleId: "$vehicle._id",

        vehicleName: "$vehicle.name",

        brand: "$vehicle.brand",

        model: "$vehicle.model",

        image: "$vehicle.images",

        totalBookings: 1,

        completedBookings: 1,

        totalRevenue: 1,
      },
    },
  ]);

  return topVehicles;
};

// active rental service
export const getActiveRentalsService = async (vendorId) => {
  const vehicles = await Vehicle.find({
    owner: vendorId,
    isDeleted: false,
  }).select("_id");

  const vehicleIds = vehicles.map((v) => v._id);

  const activeRentals = await Booking.find({
    vehicle: {
      $in: vehicleIds,
    },

    status: {
      $in: ["confirmed", "ongoing"],
    },

    isDeleted: false,
  })

    .populate("vehicle", "name brand model images")

    .populate("user", "name email phone")

    .sort({
      startDate: 1,
    })

    .lean();

  return activeRentals;
};

//earning Breakdown
export const getEarningBreakdownService = async (vendorId) => {
  // GET VENDOR VEHICLES

  const vehicles = await Vehicle.find({
    owner: vendorId,
    isDeleted: false,
  }).select("_id");

  const vehicleIds = vehicles.map((v) => v._id);

  // EARNING BREAKDOWN
  const earnings = await Booking.aggregate([
    {
      $match: {
        vehicle: {
          $in: vehicleIds,
        },

        status: "completed",

        isDeleted: false,
      },
    },

    {
      $group: {
        _id: null,

        totalRevenue: {
          $sum: "$finalPrice",
        },

        totalTax: {
          $sum: "$tax",
        },

        totalDiscount: {
          $sum: "$discount",
        },

        totalExtraCharges: {
          $sum: "$extraCharges",
        },

        totalBookings: {
          $sum: 1,
        },

        averageBookingValue: {
          $avg: "$finalPrice",
        },
      },
    },
  ]);

  const stats = earnings[0] || {};

  return {
    totalRevenue: stats.totalRevenue || 0,

    totalTax: stats.totalTax || 0,

    totalDiscount: stats.totalDiscount || 0,

    totalExtraCharges: stats.totalExtraCharges || 0,

    totalBookings: stats.totalBookings || 0,

    averageBookingValue: Math.round(stats.averageBookingValue || 0),
  };
};

// cancellation analytics
// services/dashboard.service.js

import Booking from "../models/bookingModel.js";
import Vehicle from "../models/vehicleModel.js";

export const getCancellationAnalyticsService = async (vendorId) => {
  // GET VENDOR VEHICLES

  const vehicles = await Vehicle.find({
    owner: vendorId,
    isDeleted: false,
  }).select("_id");

  const vehicleIds = vehicles.map((v) => v._id);

  // CANCELLATION ANALYTICS

  const stats = await Booking.aggregate([
    {
      $match: {
        vehicle: {
          $in: vehicleIds,
        },

        isDeleted: false,
      },
    },

    {
      $group: {
        _id: null,

        totalBookings: {
          $sum: 1,
        },

        cancelledBookings: {
          $sum: {
            $cond: [
              {
                $eq: ["$status", "cancelled"],
              },
              1,
              0,
            ],
          },
        },

        vendorCancelled: {
          $sum: {
            $cond: [
              {
                $and: [
                  {
                    $eq: ["$status", "cancelled"],
                  },
                  {
                    $eq: ["$cancelledBy", "vendor"],
                  },
                ],
              },
              1,
              0,
            ],
          },
        },

        userCancelled: {
          $sum: {
            $cond: [
              {
                $and: [
                  {
                    $eq: ["$status", "cancelled"],
                  },
                  {
                    $eq: ["$cancelledBy", "user"],
                  },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  const data = stats[0] || {};

  // =========================
  // CANCELLATION RATE
  // =========================

  const cancellationRate =
    data.totalBookings > 0
      ? ((data.cancelledBookings / data.totalBookings) * 100).toFixed(2)
      : 0;

  return {
    totalBookings: data.totalBookings || 0,

    cancelledBookings: data.cancelledBookings || 0,

    vendorCancelled: data.vendorCancelled || 0,

    userCancelled: data.userCancelled || 0,

    cancellationRate: Number(cancellationRate),
  };
};

// customer Insights
export const getCustomerInsightsService = async (vendorId) => {

  // GET VENDOR VEHICLES

  const vehicles = await Vehicle.find({
    owner: vendorId,
    isDeleted: false,
  }).select("_id");

  const vehicleIds = vehicles.map((v) => v._id);
  // CUSTOMER ANALYTICS


  const insights = await Booking.aggregate([
    {
      $match: {
        vehicle: {
          $in: vehicleIds,
        },
        isDeleted: false,
      },
    },

    // GROUP BY CUSTOMER
    {
      $group: {
        _id: "$user",

        totalBookings: {
          $sum: 1,
        },

        completedBookings: {
          $sum: {
            $cond: [
              {
                $eq: ["$status", "completed"],
              },
              1,
              0,
            ],
          },
        },

        cancelledBookings: {
          $sum: {
            $cond: [
              {
                $eq: ["$status", "cancelled"],
              },
              1,
              0,
            ],
          },
        },

        // total amount spent by customer on completed bookings
        totalSpent: {
          $sum: {
            $cond: [
              {
                $eq: ["$status", "completed"],
              },
              "$finalPrice",
              0,
            ],
          },
        },

        // total revenue generated from customer (including cancelled bookings)
        totalRevenueGenerated: {
          $sum: {
            $cond: [
              {
                $eq: ["$status", "completed"],
              },
              "$finalPrice",
              0,
            ],
          },
        },

        // average booking value for the customer
        averageBookingValue: {
          $avg: {
            $cond: [
              {
                $eq: ["$status", "completed"],
              },
              "$finalPrice",
              null,
            ],
          },
        },

        firstBookingDate: {
          $min: "$createdAt",
        },

        lastBookingDate: {
          $max: "$createdAt",
        },
      },
    },

    // SORT TOP CUSTOMERS
    {
      $sort: {
        totalSpent: -1,
      },
    },

    // JOIN USER DETAILS
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },

    {
      $unwind: "$user",
    },

    // FINAL OUTPUT
    {
      $project: {
        _id: 0,

        userId: "$user._id",
        name: "$user.name",
        email: "$user.email",
        phone: "$user.phone",

        totalBookings: 1,
        completedBookings: 1,
        cancelledBookings: 1,

        totalSpent: 1,
        totalRevenueGenerated: 1,
        averageBookingValue: 1,

        firstBookingDate: 1,
        lastBookingDate: 1,
      },
    },
  ]);


  // GLOBAL STATS

  const totalUniqueCustomers = insights.length;

  const repeatCustomers = insights.filter((c) => c.totalBookings > 1).length;

  const newCustomers = insights.filter((c) => c.totalBookings === 1).length;

  return {
    totalUniqueCustomers,
    repeatCustomers,
    newCustomers,
    customers: insights,
  };
};
