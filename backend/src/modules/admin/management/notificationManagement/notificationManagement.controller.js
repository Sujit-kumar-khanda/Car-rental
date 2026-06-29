// admin-notification.controller.js

import * as notificationService from "./notification.service.js";

export const getAllNotifications = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await notificationService.getAllNotificationsService(
      page,
      limit,
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getNotificationDetails = async (req, res) => {
  try {
    const notification =
      await notificationService.getNotificationDetailsService(
        req.params.notificationId,
      );

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(error.message === "Notification not found" ? 404 : 400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getNotificationStats = async (req, res) => {
  try {
    const stats = await notificationService.getNotificationStatsService();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const sendBroadcastNotification = async (req, res) => {
  try {
    const { role, title, message, type } = req.body;

    await notificationService.sendBroadcastNotificationService({
      role,
      title,
      message,
      type,
    });

    res.status(201).json({
      success: true,
      message: "Notification sent successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
