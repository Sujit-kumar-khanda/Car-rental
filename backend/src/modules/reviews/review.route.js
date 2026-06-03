router.patch(
  "/hide/:reviewId",
  protect,
  reviewController.hideReview,
);

router.get(
  "/hidden/vehicle/:vehicleId",
  protect,
  authorize("admin", "superadmin"),
  reviewController.getHiddenVehicleReviews,
);

router.get(
  "/my-reviews",
  protect,
  reviewController.getPersonalReviews,
);

router.get(
  "/vehicle-reviews",
  protect,
  authorize("admin", "superadmin"),
  reviewController.getPersonalVehicleReviews,
);