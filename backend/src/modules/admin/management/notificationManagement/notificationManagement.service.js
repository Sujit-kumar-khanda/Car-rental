import Notification from "../../../notifications/notification.model.js";
import User from "../../../users/user.model.js";

export const getAllNotificationsService = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find()
      .populate("user", "name email role")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),

    Notification.countDocuments(),
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getNotificationDetailsService = async (notificationId) => {
  const notification = await Notification.findById(notificationId).populate(
    "user",
    "name email role",
  );

  if (!notification) {
    throw new Error("Notification not found");
  }

  return notification;
};

export const getNotificationStatsService = async () => {
  const [total, read, unread] = await Promise.all([
    Notification.countDocuments(),

    Notification.countDocuments({
      isRead: true,
    }),

    Notification.countDocuments({
      isRead: false,
    }),
  ]);

  return {
    totalNotifications: total,
    read,
    unread,
  };
};

// Send notification to all users/vendors.
export const sendBroadcastNotificationService = async ({
  role,
  title,
  message,
  type,
}) => {
  const users = await User.find({
    role,
    isDeleted: false,
  }).select("_id");

  const notifications = users.map((user) => ({
    user: user._id,
    title,
    message,
    type,
  }));

  await Notification.insertMany(notifications);

  return true;
};
