import * as reviewService from "./review.service.js";

// Add Review (User Only)
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const result = await reviewService.addReviewService(
      req.params.vehicleId,
      req.user,
      rating,
      comment,
    );

    res.status(201).json({
      message: "Review added successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Reviews for a vehicle (Public) and show in ui
export const getVehicleReviews = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const page = Math.max(1, parseInt(req.query.page) || 1);

    const limit = Math.max(1, parseInt(req.query.limit) || 5);

    const result = await reviewService.getVehicleReviewsService(
      vehicleId,
      page,
      limit,
    );

    return res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Hide Review (Admin Only)
export const hideReview = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const result = await reviewService.hideReviewService(
      req.params.reviewId,
      req.user,
    );

    return res.status(200).json({
      success: true,
      message: "Review hidden successfully",
      data: result,
    });
  } catch (error) {
    const status =
      error.message === "Review not found"
        ? 404
        : error.message === "Not allowed"
          ? 403
          : 400;

    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

// Unhide Review (Admin Only)
export const unHideReview = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const result = await reviewService.unHideReviewService(
      req.params.reviewId,
      req.user,
    );

    return res.status(200).json({
      success: true,
      message: "Review unhidden successfully",
      data: result,
    });
  } catch (error) {
    const status =
      error.message === "Review not found"
        ? 404
        : error.message === "Not allowed"
          ? 403
          : 400;

    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Hidden Reviews for a vehicle (Admin and superadmin only)
export const getHiddenVehicleReviews = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    if (req.user.role === "user") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }
    const page = Math.max(1, parseInt(req.query.page) || 1);

    const limit = Math.max(1, parseInt(req.query.limit) || 5);

    const result = await reviewService.getHiddenVehicleReviewsService(
      vehicleId,
      page,
      limit,
    );

    return res.status(200).json({
      success: true,
      message: "Hidden reviews fetched successfully",
      data: result,
    });
  } catch (error) {
    const status =
      error.message === "Vehicle not found"
        ? 404
        : error.message === "Not allowed"
          ? 403
          : 400;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Personal Reviews (User Only)
export const getPersonalReviews = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);

    const limit = Math.max(1, parseInt(req.query.limit) || 5);

    const result = await reviewService.getPersonalReviewsService(
      req.user._id,
      page,
      limit,
    );

    return res.status(200).json({
      success: true,
      message: "Personal reviews fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get personalVehicle Reviews (Admin Only)
export const getPersonalVehicleReviews = async (req, res) => {
  try {
    if (["user", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }
    const page = Math.max(1, parseInt(req.query.page) || 1);

    const limit = Math.max(1, parseInt(req.query.limit) || 5);

    const result = await reviewService.getPersonalVehicleReviewsService(
      req.user,
      page,
      limit,
    );

    return res.status(200).json({
      success: true,
      message: "Vehicle reviews fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
