import * as dashboardService from "./dashboard.service.js";

// Get vehicle stats for vendor
export const getVendorVehicleStats = async (req, res) => {
  try {
    const stats = await dashboardService.getVendorVehicleStatsService(
      req.user.id,
    );

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get vendor overview
export const getVendorOverview = async (req, res) => {
  try {
    const overview = await dashboardService.getVendorOverviewService(
      req.user.id,
    );

    res.status(200).json({
      success: true,
      overview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get vendor revenue analytics
export const getVendorRevenueAnalytics = async (req, res) => {
  try {
    const filter = req.query.filter || "monthly";

    const analytics = await dashboardService.getVendorRevenueAnalyticsService(
      req.user._id,
      filter,
    );

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Booking trends
export const getVendorBookingTrends = async (req, res) => {
  try {
    const filter = req.query.filter || "monthly";

    const trends = await dashboardService.getVendorBookingTrendsService(
      req.user.id,
      filter,
    );

    res.status(200).json({
      success: true,
      trends,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get top performing vehicles for vendor
export const getTopPerformingVehicles = async (req, res) => {
  try {
    const limit = req.query.limit || 5;

    const vehicles = await dashboardService.getTopPerformingVehiclesService(
      req.user.id,
      limit,
    );

    res.status(200).json({
      success: true,
      vehicles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// active rentals
export const getActiveRentals = async (req, res) => {
  try {
    const rentals = await dashboardService.getActiveRentalsService(req.user.id);

    res.status(200).json({
      success: true,
      count: rentals.length,
      rentals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Earning breakdown
export const getEarningBreakdown = async (req, res) => {
  try {
    const data = await dashboardService.getEarningBreakdownService(req.user.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Cancellation analytics
export const getCancellationAnalytics = async (req, res) => {
  try {
    const analytics = await dashboardService.getCancellationAnalyticsService(
      req.user.id,
    );

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get customer insights for vendor
export const getCustomerInsights = async (req, res) => {
  try {
    const vendorId = req.user._id;

    const data = await dashboardService.getCustomerInsightsService(vendorId);

    return res.status(200).json({
      success: true,
      message: "Customer insights fetched successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
