import express from "express";

import * as vehicleController from "./vehicle.controller.js";
import { protectRoute } from "../users/user.middleware.js";

const router = express.Router();

router.post("/add", protectRoute, vehicleController.addVehicle);
router.get("/vendor", protectRoute, vehicleController.getVendorVehicles);
router.get("/", vehicleController.getAllVehicles);
router.get("/:id", vehicleController.getVehicleById);
router.put("/:id", protectRoute, vehicleController.updateVehicle);
router.delete("/:id", protectRoute, vehicleController.deleteVehicle);
router.put("/restore/:id", protectRoute, vehicleController.restoreVehicle);
router.delete("/images/:id", protectRoute, vehicleController.deleteVehicleImage);
router.put("/toggle-availability/:id", protectRoute, vehicleController.toggleAvailability);
router.get("/pending-approval", protectRoute, vehicleController.getPendingApprovals);
router.put("/approve/:id", protectRoute, vehicleController.approveVehicle);
router.put("/reject/:id", protectRoute, vehicleController.rejectVehicle);

export default router;


