import express from "express";
import * as couponController from "./couponManagement.controller.js";
import { protectRoute, authorize } from "../../../auth/auth.middleware.js";

const router = express.Router();

router.post("/coupons", protectRoute, authorize("admin"), couponController.createCoupon);

router.get("/coupons", protectRoute, authorize("admin"), couponController.getAllCoupons);

router.get(
  "/coupons/stats",
  protectRoute,
  authorize("superadmin"),
  couponController.getCouponStats
);

router.get(
  "/coupons/:couponId",
  protectRoute,
  authorize("superadmin"),
  couponController.getCouponDetails
);

router.patch(
  "/coupons/:couponId",
  protectRoute,
  authorize("superadmin"),
  couponController.updateCoupon
);

router.patch(
  "/coupons/:couponId/toggle",
  protectRoute,
  authorize("superadmin"),
  couponController.toggleCoupon
);

router.delete(
  "/coupons/:couponId",
  protectRoute,
  authorize("superadmin"),
  couponController.deleteCoupon
);

export default router;