import * as paymentController from './payment.controller.js';

import express from "express";
import { protectRoute, authorize } from "../auth/auth.middleware.js";

const router = express.Router();

router.post( "/create-order/:bookingNumber", protectRoute, paymentController.createPaymentOrder);
router.post("/collect-cash/:bookingNumber", protectRoute, paymentController.collectCashAndConfirmBooking);
router.post(
  "/:bookingNumber/security-deposit/cash-refund",
  protectRoute,
  authorize("admin"),
  paymentController.cashRefundSecurityDeposit,
);

export default router;