// admin-notification.routes.js

import express from "express";

import * as notificationController from "./notificationManagement.controller.js";

import { protectRoute, authorize } from "../../../auth/auth.middleware.js";

const router = express.Router();

router.get(
  "/notifications",
  protectRoute,
  authorize("superadmin"),
  notificationController.getAllNotifications,
);

router.get(
  "/notifications/stats",
  protectRoute,
  authorize("superadmin"),
  notificationController.getNotificationStats,
);

router.get(
  "/notifications/:notificationId",
  protectRoute,
  authorize("superadmin"),
  notificationController.getNotificationDetails,
);

router.post(
  "/notifications/broadcast",
  protectRoute,
  authorize("superadmin"),
  notificationController.sendBroadcastNotification,
);

export default router;
