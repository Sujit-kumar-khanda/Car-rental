import express from "express";

import { getUserProfile, updateUserProfile, requestVendorAccess } from "./user.controller.js";
import { protectRoute } from "./user.middleware.js";

const router = express.Router();

router.get("/profile", protectRoute, getUserProfile);
router.put("/profile", protectRoute, updateUserProfile);
router.post("/vendor-request", protectRoute, requestVendorAccess);

export default router;
