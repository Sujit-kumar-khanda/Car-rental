import express from "express";

import * as vehicleController from "./vehicle.controller.js";
import { protectRoute, authorize } from "../users/user.middleware.js";

const router = express.Router();

router.post("/add", protectRoute,authorize("vendor", "superadmin"), vehicleController.addVehicle);
router.get("/vendor", protectRoute, authorize("vendor"), vehicleController.getVendorVehicles);
router.get("/", protectRoute,  vehicleController.getAllVehicles);
router.get("/:id", vehicleController.getVehicleById);
router.put("/:id", protectRoute, authorize("vendor", "superadmin"),vehicleController.updateVehicle);
router.delete("/:id", protectRoute, authorize("vendor", "superadmin"), vehicleController.deleteVehicle);
router.put("/restore/:id", protectRoute, authorize("vendor", "superadmin"), vehicleController.restoreVehicle);
router.delete("/images/:id", protectRoute, authorize("vendor", "superadmin"), vehicleController.deleteVehicleImage);
router.put("/toggle-availability/:id", protectRoute, authorize("vendor", "superadmin"), vehicleController.toggleAvailability);



export default router;


