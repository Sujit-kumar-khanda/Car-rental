import express from "express";
import * as notificationController from "./notification.controller.js";

const router = express.Router();

router.get("/", notificationController.getMyNotifications);

router.get("/unread-count", notificationController.getUnreadCount);

router.patch("/read-all", notificationController.markAllNotificationsRead);

router.patch(
  "/:notificationId/read",
  notificationController.markNotificationRead,
);

export default router;
