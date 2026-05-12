import express from "express";

import * as bookingController from "../controller/bookingController.js";
import { protect, authorizeRoles} from "../middleware/authMiddleware.js";

const router = express.Router();

// USER ROUTES
router.post("/", protect, createBooking);
router.get("/my-bookings", protect, getUserBookings);
router.get("/:id", protect, getBookingById);
router.put("/cancel/:id", protect, cancelBooking);

// VENDOR ROUTES
router.put("/approve/:id", protect, authorizeRoles("vendor", "superAdmin"), approveBooking);

router.put("/confirm/:id",protect,authorizeRoles
("vendor", "superadmin"),confirmBooking
);
router.put("/start/:id",protect,authorizeRoles("vendor", "superadmin"),startBooking
);
router.put("/complete/:id", protect, authorizeRoles("vendor", "superAdmin"), completeBooking);

// router.put("/reject/:id", protect, authorizeRoles("vendor", "superAdmin"), rejectBooking);

router.get("/vehicle-bookings",protect,authorizeRoles("vendor", "superadmin"),getVehicleBookings
);

// ADMIN ROUTES
router.delete("/:id",protect,authorizeRoles
("superadmin"),deleteBooking
);

router.put("/expire",protect,authorizeRoles
("superadmin"),expireBookings
);

export default router;

