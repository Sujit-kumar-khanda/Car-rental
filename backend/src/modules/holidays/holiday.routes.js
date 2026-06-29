import express from "express";

import * as holidayController from "./holiday.controller.js";
import { protectRoute } from "../users/user.middleware.js";

const router = express.Router();

router.post("/add", protectRoute, holidayController.addHoliday);
router.put("/toggle/:id", protectRoute, holidayController.toggleHoliday);
router.delete("/delete/:id", protectRoute, holidayController.deleteHoliday);
router.put("/restore/:id", protectRoute, holidayController.restoreHoliday);
router.put("/update/:id", protectRoute, holidayController.updateHoliday);
router.get("/", holidayController.getAllHolidays);
router.get("/:id", holidayController.getHolidayById);
router.get("/active", holidayController.getActiveHolidays);
router.get("/Current", holidayController.getCurrentHoliday);

export default router;