import express from "express";
import * as bookingController from "./booking.controller.js";

const router = express.Router();

/* =========================
   👤 CUSTOMER ROUTES
========================= */

// Create booking
router.post("/", bookingController.createBooking);

// My current active booking
router.get("/my/current", bookingController.getMyCurrentBookings);

// My booking history
router.get("/my/history", bookingController.getMyBookingHistory);

// My single booking details
router.get("/my/:bookingNumber", bookingController.getMyBookingByNumber);


/* =========================
   🏢 VENDOR ROUTES
========================= */

// Vendor current bookings
router.get("/vendor/current", bookingController.getVendorCurrentBookings);

// Vendor booking history
router.get("/vendor/history", bookingController.getVendorBookingsHistory);

// Vendor single booking details
router.get("/vendor/:bookingNumber", bookingController.getVendorBookingByNumber);


/* =========================
   📄 COMMON (DETAILS)
========================= */

// Public booking fetch (role-based access inside controller)
router.get("/:bookingNumber", bookingController.getBookingById);


/* =========================
   ⚙️ BOOKING LIFECYCLE
   (STATE CHANGES ONLY)
========================= */

// Approve booking (vendor/admin)
router.patch(
  "/:bookingNumber/approve",
  bookingController.approveBooking,
);

// Confirm booking (after payment)
router.patch(
  "/:bookingNumber/confirm",
  bookingController.confirmCashBooking,
);

// Start booking (pickup OTP verification)
router.patch(
  "/:bookingNumber/start",
  bookingController.startBooking,
);

// Complete booking (drop OTP verification + settlement)
router.patch(
  "/:bookingNumber/complete",
  bookingController.completeBooking,
);

// Cancel booking (user/vendor/admin)
router.patch(
  "/:bookingNumber/cancel",
  bookingController.cancelBooking,
);


/* =========================
   🗑️ ADMIN / VENDOR OPS
========================= */

// Soft delete booking (only vendor/admin)
router.delete(
  "/:bookingNumber",
  bookingController.deleteBooking,
);

// Restore booking
router.patch(
  "/:bookingNumber/restore",
  bookingController.restoreBooking,
);


/* =========================
   💳 PAYMENT / DEPOSIT
========================= */

// Payment success callback (online payments)
router.post(
  "/:bookingNumber/payment/success",
  bookingController.paymentSuccess,
);

// Security deposit hold
router.post(
  "/:bookingNumber/deposit/hold",
  bookingController.holdSecurityDeposit,
);

// Security deposit release
router.post(
  "/:bookingNumber/deposit/release",
  bookingController.releaseSecurityDeposit,
);


export default router;