import * as vehicleManagementController from "./vehicleManagement.controller.js";
import { authorize, protectRoute } from "../../../auth/auth.middleware.js";
import express from "express";

const router = express.Router();

router.get(
  "/vehicles",
  protectRoute,
  authorize("superadmin"),
  vehicleManagementController.getVehicles,
);
router.get(
  "/vehicles/:vehicleId",
  protectRoute,
  authorize("superadmin"),
  vehicleManagementController.getVehicleDetails,
);
router.put(
  "/vehicles/:vehicleId/approve",
  protectRoute,
  authorize("superadmin"),
  vehicleManagementController.approveVehicle,
);
router.put(
  "/vehicles/:vehicleId/reject",
  protectRoute,
  authorize("superadmin"),
  vehicleManagementController.rejectVehicle,
);

export default router;
