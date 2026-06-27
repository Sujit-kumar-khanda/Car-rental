export const getDashboardStatsService = async () => {
  const [
    totalUsers,
    totalVendors,
    totalVehicles,
    activeVehicles,
    totalBookings,
    pendingBookings,
    completedBookings,
    cancelledBookings,
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),

    User.countDocuments({
      role: "admin",
    }),

    Vehicle.countDocuments(),

    Vehicle.countDocuments({
      status: "active",
    }),

    Booking.countDocuments({
      isDeleted: false,
    }),

    Booking.countDocuments({
      status: "pending",
      isDeleted: false,
    }),

    Booking.countDocuments({
      status: "completed",
      isDeleted: false,
    }),

    Booking.countDocuments({
      status: "cancelled",
      isDeleted: false,
    }),
  ]);

  const revenueResult = await Booking.aggregate([
    {
      $match: {
        status: {
          $in: ["confirmed", "ongoing", "completed"],
        },
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: "$pricePaidByCustomer",
        },
      },
    },
  ]);

  const totalRevenue =
    revenueResult[0]?.totalRevenue || 0;

  return {
    totalUsers,
    totalVendors,
    totalVehicles,
    activeVehicles,
    totalBookings,
    pendingBookings,
    completedBookings,
    cancelledBookings,
    totalRevenue,
  };
};