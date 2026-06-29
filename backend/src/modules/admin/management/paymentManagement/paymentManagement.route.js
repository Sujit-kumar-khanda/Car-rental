const express = require("express");
const router = express.Router();
import * as paymentController from "./paymentManagement.controller.js";
import { protectRoute, authorize } from "../../../auth/auth.middleware.js";

router.get(
  "/payments",
  protectRoute,
  authorize("superadmin"),
  paymentController.getAllPayments,
);

router.get(
  "/payments/stats",
  protectRoute,
  authorize("superadmin"),
  paymentController.getPaymentStats,
);

router.get(
  "/payments/refund-pending",
  protectRoute,
  authorize("superadmin"),
  paymentController.getRefundPending,
);

router.post(
  "/payments/:bookingNumber/retry-refund",
  protectRoute,
  authorize("superadmin"),
  paymentController.retryRefund,
);

router.get(
  "/payments/:bookingId",
  protectRoute,
  authorize("superadmin"),
  paymentController.getPaymentDetails,
);

export default router;