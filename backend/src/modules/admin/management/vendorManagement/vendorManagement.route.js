import express from "express";
import * as vendorManagementController from "./vendorManagement.controller.js";
import { authorize, protectRoute } from "../../../auth/auth.middleware.js";

const router = express.Router();

router.get(
  "/vendors",
  protectRoute,
  authorize("superadmin"),
  vendorManagementController.getVendors,
);

router.get(
  "/vendors/:vendorId",
  protectRoute,
  authorize("superadmin"),
  vendorManagementController.getVendorDetails,
);

router.put(
  "/vendors/:vendorId/block",
  protectRoute,
  authorize("superadmin"),
  vendorManagementController.blockVendor,
);

router.put(
  "/vendors/:vendorId/unblock",
  protectRoute,
  authorize("superadmin"),
  vendorManagementController.unblockVendor,
);

router.delete(
  "/vendors/:vendorId",
  protectRoute,
  authorize("superadmin"),
  vendorManagementController.deleteVendor,
);

router.put(
  "/vendors/:vendorId/restore",
  protectRoute,
  authorize("superadmin"),
  vendorManagementController.restoreVendor,
);

export default router;

