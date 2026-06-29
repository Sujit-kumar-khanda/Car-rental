import Notification from "./notification.model.js";

export const createNotificationService = async ({
  user,
  title,
  message,
  type,
  referenceId = null,
}) => {
  return Notification.create({
    user,
    title,
    message,
    type,
    referenceId,
  });
};

export const getMyNotificationsService = async (
  userId,
  page = 1,
  limit = 10,
) => {
  const skip = (page - 1) * limit;

  const filter = {
    user: userId,
  };

  const [notifications, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),

    Notification.countDocuments(filter),
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

export const markNotificationReadService = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    user: userId,
  });

  if (!notification) {
    throw new Error("Notification not found");
  }

  notification.isRead = true;

  await notification.save();

  return notification;
};

export const markAllNotificationsReadService = async (userId) => {
  await Notification.updateMany(
    {
      user: userId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
      },
    },
  );

  return true;
};

export const getUnreadCountService = async (userId) => {
  return Notification.countDocuments({
    user: userId,
    isRead: false,
  });
};
