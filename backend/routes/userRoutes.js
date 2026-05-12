import express from 'express';
import {getUserProfile, updateUserProfile, requestVendorAccess} from "../controller/userController.js";
import {protect} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getUserProfile);
router.put("/update", protect, updateUserProfile);
router.post("request-vendor", protect, requestVendorAccess);

export default router;
