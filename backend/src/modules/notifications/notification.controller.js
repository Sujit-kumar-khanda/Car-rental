import * as notificationService from "./notification.service.js";

export const getMyNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;

    const limit = parseInt(req.query.limit) || 10;

    const result = await notificationService.getMyNotificationsService(req.user._id, page, limit);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
        const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const result = await notificationService.markNotificationReadService(
      req.params.notificationId,
      req.user._id,
    );

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: result,
    });
  } catch (error) {
        const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await notificationService.markAllNotificationsReadService(req.user._id);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
        const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCountService(req.user._id);

    res.status(200).json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
        const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};
