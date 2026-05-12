import express from "express";
import * as Vechilecontroller from "../controller/vechileController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {checkVendorApproval} from "../middleware/approvalMiddleware.js";


const router = express.Router();

// public routes
router.get("/all-vechile", getAllVechiles);

router.get("/:id", getVehicleById);

// Vendor / superAdmin routes

router.post("/add-vehicle", protect, authroizeRoles("vendor", "superadmin"), checkVendorApproval, addVechile);

router.put("/update/:id", protect, authroizeRoles("vendor", "superadmin"),checkVendorApproval, updateVechile);

router.delete("/delete:id", protect, authroizeRoles("vendor", "superadmin"), checkVendorApproval, deleteVechile);

router.delete("/delete-vehicle-image/:id", protect, authroizeRoles("vendor", "superadmin"),checkVendorApproval, deletevechileImage);

router.get("/:id/toggle-availability", protect, authroizeRoles("vendor", "superadmin"),checkVendorApproval,  toggleAvailability);