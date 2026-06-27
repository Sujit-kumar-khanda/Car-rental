router.get(
  "/admin/bookings",
  protectRoute,
  authorize("superadmin"),
  bookingController.getAllBookings,
);

router.get(
  "/admin/bookings",
  protectRoute,
  authorize("superadmin"),
  bookingController.getAllBookings,
);