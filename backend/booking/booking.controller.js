import * as bookingService from "../booking/booking.service.js";

// ================= USER ACTIONS =================

// CREATE BOOKING
export const createBooking = async (req, res) => {
  try {
    const booking = await bookingService.createBookingService({
      ...req.body,
      userId: req.user.id,
    });

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
      req.body.cancelReason
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

// GET USER BOOKINGS
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getUserBookingsService(
      req.user.id
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

// GET SINGLE BOOKING
export const getBookingById = async (req, res) => {
  try {
    const booking = await bookingService.getBookingByIdService(
      req.params.bookingNumber,
      req.user
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

// ================= VENDOR ACTIONS =================

// APPROVE BOOKING
export const approveBooking = async (req, res) => {
  try {
    const booking = await bookingService.approveBookingService(
      req.params.bookingNumber,
      req.user
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

// CONFIRM BOOKING (FIXED BUG HERE)
export const confirmBooking = async (req, res) => {
  try {
    const booking = await bookingService.confirmBookingService(
      req.params.bookingNumber,
      req.user   // ✅ FIXED (was req.body before)
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
    const booking = await bookingService.startBookingService(
      req.params.bookingNumber,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Trip started successfully",
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

// COMPLETE TRIP
export const completeBooking = async (req, res) => {
  try {
    const booking = await bookingService.completeBookingService(
      req.params.bookingNumber,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Trip completed successfully",
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

// GET VENDOR BOOKINGS
export const getVehicleBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getVehicleBookingsService(
      req.user.id
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
      req.user
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