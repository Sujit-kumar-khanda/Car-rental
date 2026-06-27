import * as bookingService from "../booking/booking.service.js";

// ================= USER ACTIONS =================

// CREATE BOOKING
export const createBooking = async (req, res) => {
  try {
    const booking = await bookingService.createBookingService(
      req.body,
      req.user.id,
    );

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// CANCEL BOOKING (USER + VENDOR)
export const cancelBooking = async (req, res) => {
  try {
    const booking = await bookingService.cancelBookingService(
      req.params.bookingNumber,
      req.user,
      req.body.cancelReason,
    );

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    const status =
      error.message === "Booking not found"
        ? 404
        : error.message.includes("Not allowed")
          ? 403
          : 400;

    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

// GET USER CURRENT BOOKINGS
export const getMyCurrentBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getUserCurrentBookingsService(
      req.user.id,
    );

    return res.status(200).json({
      success: true,
      total: bookings.length,
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE BOOKING OF USER BY BOOKING NUMBER
export const getMyBookingByNumber = async (req, res) => {
  try {
    const booking = await bookingService.getMyBookingByNumberService(
      req.params.bookingNumber,
      req.user,
    );

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    const status =
      error.message === "Booking not found"
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

// GET USER BOOKING HISTORY (PAGINATED)
export const getMyBookingHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await getMyBookingHistoryService(userId, page, limit);

    return res.status(200).json({
      success: true,
      message: "Booking history fetched successfully",
      data: result.bookings,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ================= VENDOR ACTIONS =================

// APPROVE BOOKING
export const approveBooking = async (req, res) => {
  try {
    const booking = await bookingService.approveBookingService(
      req.params.bookingNumber,
      req.user,
    );

    return res.status(200).json({
      success: true,
      message: "Booking approved successfully",
      booking,
    });
  } catch (error) {
    const status =
      error.message === "Booking not found"
        ? 404
        : error.message.includes("Not allowed")
          ? 403
          : 400;

    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

// CONFIRM CASH BOOKING (FIXED BUG HERE)
export const confirmCashBooking = async (req, res) => {
  try {
    const booking = await bookingService.collectCashAndConfirmBookingService(
      req.params.bookingNumber,
      req.user, // ✅ FIXED (was req.body before)
    );

    return res.status(200).json({
      success: true,
      message: "Booking confirmed successfully",
      booking,
    });
  } catch (error) {
    const status =
      error.message === "Booking not found"
        ? 404
        : error.message.includes("Not allowed")
          ? 403
          : 400;

    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

// START TRIP
export const startBooking = async (req, res) => {
  try {
    const { bookingNumber } = req.params;
    const { otp } = req.body;

    const user = req.user;

    if (!bookingNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: "bookingNumber and OTP are required",
      });
    }

    const result = await bookingService.startBookingService(
      bookingNumber,
      otp,
      user,
    );

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        bookingNumber: result.bookingNumber,
        status: result.status,
        startedAt: result.startedAt,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to start booking",
    });
  }
};

// COMPLETE TRIP
export const completeBooking = async (req, res) => {
  try {
    const { bookingNumber } = req.params;
    const { deductionAmount, deductionReason, otp } = req.body;

    const result = await bookingService.completeBookingService(
      bookingNumber,
      deductionAmount,
      deductionReason,
      otp,
      req.user,
    );

    return res.status(200).json({
      success: true,
      message: "Trip completed successfully",
      data: {
        bookingNumber: result.bookingNumber,
        status: result.status,
        completedAt: result.completedAt,
      },
    });
  } catch (error) {
    const status =
      error.message === "Booking not found"
        ? 404
        : error.message.includes("Not allowed")
          ? 403
          : 400;

    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

// GET VENDOR BOOKINGS
export const getVendorCurrentBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await bookingService.getVendorCurrentBookingsService(
      req.user.id,
      page,
      limit,
    );

    return res.status(200).json({
      success: true,
      total: result.bookings.length,
      bookings: result.bookings,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET VENDOR BOOKING HISTORY
export const getVendorBookingsHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await bookingService.getVendorBookingsHistoryService(
      req.user.id,
      page,
      limit,
    );

    return res.status(200).json({
      success: true,
      total: result.bookings.length,
      bookings: result.bookings,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get single booking of vendor by booking number
export const getVendorBookingByNumber = async (req, res) => {
  try {
    const booking = await bookingService.getVendorBookingByNumberService(
      req.params.bookingNumber,
      req.user,
    );

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= ADMIN ACTIONS =================

// EXPIRE BOOKINGS (ADMIN ONLY)
export const autoExpireBookings = async (req, res) => {
  try {
    const result = await bookingService.autoExpireBookingsService();

    return res.status(200).json({
      success: true,
      message: "Expired bookings updated successfully",
      modifiedCount: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE BOOKING (SOFT DELETE)
export const deleteBooking = async (req, res) => {
  try {
    await bookingService.deleteBookingService(
      req.params.bookingNumber,
      req.user,
    );

    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    const status =
      error.message === "Booking not found"
        ? 404
        : error.message.includes("Not allowed")
          ? 403
          : 400;

    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE BOOKING (SOFT DELETE)
export const restoreBooking = async (req, res) => {
  try {
    await bookingService.restoreBookingService(
      req.params.bookingNumber,
      req.user,
    );

    return res.status(200).json({
      success: true,
      message: "Booking restored successfully",
    });
  } catch (error) {
    const status =
      error.message === "Booking not found"
        ? 404
        : error.message.includes("Not allowed")
          ? 403
          : 400;

    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPendingSecurityDeposits = async (req, res) => {
  try {
    const bookings = await bookingService.getPendingSecurityDepositsService(
      req.user,
    );

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// booking.controller.js

export const releaseSecurityDeposit = async (req, res) => {
  try {
    const { bookingNumber } = req.params;

    const { deductionAmount = 0, deductionReason } = req.body;

    const result = await bookingService.releaseSecurityDepositService(
      bookingNumber,
      deductionAmount,
      deductionReason,
      req.user,
    );

    res.status(200).json({
      success: true,
      message: "Security deposit released successfully",
      data: result,
    });
  } catch (error) {
    res.status(error.message === "Booking not found" ? 404 : 400).json({
      success: false,
      message: error.message,
    });
  }
};
