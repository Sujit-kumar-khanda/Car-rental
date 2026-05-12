import express from "express";

import * as bookingController from "../booking/booking.controller.js";
import { protect, authorizeRoles} from "../middleware/authMiddleware.js";

const router = express.Router();

//======== USER ROUTES ==========

//create booking
router.post("/", protect, bookingController.createBooking);

//logged-in user bookings
router.get("/my-bookings", protect, bookingController.getUserBookings);

// Get single booking by booking number
router.get("/:bookingNumber", protect, bookingController.getBookingById);

//cancel booking
router.put("/cancel/:bookingNumber", protect, bookingController.cancelBooking);

 
// =========== vendor routes ===========

//All booking of vendor's vehicles
router.get("/vehicle-bookings",protect,authorizeRoles("vendor", "superadmin"),bookingController.getVehicleBookings
);

// approve booking
router.put("/approve/:bookingNumber", protect, authorizeRoles("vendor", "superadmin"), bookingController.approveBooking);

// confirm booking 
router.put("/confirm/:bookingNumber",protect,authorizeRoles
("vendor", "superadmin"),bookingController.confirmBooking
);

// start tr
router.put("/start/:bookingNumber",protect,authorizeRoles("vendor", "superadmin"),bookingController.startBooking
);
router.put("/complete/:bookingNumber", protect, authorizeRoles("vendor", "superadmin"), bookingController.completeBooking);

// router.put("/reject/:id", protect, authorizeRoles("vendor", "superadmin"), rejectBooking);


// admin routes
router.put("/expire",protect,authorizeRoles
("superadmin"),bookingController.expireBookings
);

// soft delet booking
router.delete("/:bookingNumber",protect,authorizeRoles
("superadmin"),bookingController.deleteBooking
);
export default router;

