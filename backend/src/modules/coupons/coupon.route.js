import express from "express";
import * as couponController from "./coupon.controller.js";
import { protectRoute, authorize } from "../auth/auth.middleware.js";

const router = express.Router();

router.get(
  "/coupons",
  protectRoute,
  authorize("user", "admin", "superadmin"),
  couponController.getAvailableCoupons,
);

router.post(
  "/coupons/apply",
  protectRoute,
  authorize("user"),
  couponController.applyCoupon,
);

export default router;