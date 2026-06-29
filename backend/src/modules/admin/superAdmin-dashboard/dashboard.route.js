router.get(
  "/dashboard",
  protect,
  authorize("superadmin"),
  dashboardController.getDashboardStats,
);