

import express from "express";
import * as userManagementController from "./userManagement.controller.js";
import { authorize, protectRoute } from "../../../auth/auth.middleware.js";

const router = express.Router();

router.get(
  "/users",
  protectRoute,
  authorize("superadmin"),
  userManagementController.getUsers,
);

router.get(
  "/users/:userId",
  protectRoute,
  authorize("superadmin"),
  userManagementController.getUserDetails,
);

router.put(
  "/users/:userId/block",
  protectRoute,
  authorize("superadmin"),
  userManagementController.blockUser,
);

router.put(
  "/users/:userId/unblock",
  protectRoute,
  authorize("superadmin"),
  userManagementController.unblockUser,
);

router.delete(
  "/users/:userId",
  protect,
  authorize("superadmin"),
  userManagementController.deleteUser,
);

router.put(
  "/users/:userId/restore",
  protect,
  authorize("superadmin"),
  userManagementController.restoreUser,
);

export default router;