import { createNotificationService } from "../../../notifications/notification.service.js";
import User from "../user/user.model.js";

// 1 - GET USERS
export const getUsersService = async (
  page = 1,
  limit = 10,
  search = "",
  status = "",
) => {
  const skip = (page - 1) * limit;

  const filter = {
    role: "user",
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
        email: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  if (status) {
    filter.status = status;
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("name email phone  createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getUserDetailsService = async (userId) => {
  const user = await User.findOne({
    _id: userId,
    role: "user",
  }).select("name email photo phone isBlocked createdAt updatedAt");

  if (!user) {
    throw new Error("User not found");
  }

  const [
    totalBookings,
    pendindBookings,
    OngoingBookngs,
    completeBookngs,
    cancellBookings,
  ] = await Promise.all([
    Booking.countDocuments({
      customer: userId,
      isDeleted: false,
    }),
    Booking.countDocuments({
      customer: userId,
      status: "pending",
      isDeleted: false,
    }),
    Booking.countDocuments({
      customer: userId,
      status: "ongoing",
      isDeleted: false,
    }),
    Booking.countDocuments({
      customer: userId,
      status: "completed",
      isDeleted: false,
    }),
    Booking.countDocuments({
      customer: userId,
      status: "cancelled",
      isDeleted: false,
    }),
  ]);

  return {
    user,
    stats: {
      totalBookings,
      pendingBookings,
      ongoingBookings,
      completedBookings,
      cancelledBookings,
    },
  };
};

export const deleteUserService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const activeBooking = await Booking.exists({
    user: userId,
    status: {
      $in: ["approved", "confirmed", "ongoing"],
    },
  });

  if (activeBooking) {
    throw new Error("Cannot delete user with active bookings");
  }

  if (user.isDeleted) {
    throw new Error("User already deleted");
  }

  user.isDeleted = true;

  await user.save();

  return true;
};

export const restoreUserService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isDeleted) {
    throw new Error("User is not deleted");
  }

  user.isDeleted = false;
  await user.save();
  return true;
};

export const blockUserService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.isBlocked) {
    throw new Error("User already blocked");
  }

  user.isBlocked = true;

  await user.save();

  await createNotificationService({
    user: userId,
    title: "Account Blocked",
    type: "account",
    message:
      "Your account has been blocked. Please contact support for more information.",
  });

  return user;
};

export const unblockUserService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.isBlocked = false;

  await user.save();
  await createNotificationService({
    user: userId,
    title: "Account Unblocked",
    type: "account",
    message:
      "Your account has been unblocked. You can now access all features of our service.",
  });

  return user;
};
