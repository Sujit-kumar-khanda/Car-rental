import * as bookingService from "../services/bookingService.js";

// ==========================================
// CREATE BOOKING
// ==========================================
export const createBooking = async (req, res) => {
  try {
    const booking = await bookingService.createBookingService(req);

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

// ==========================================
// APPROVE BOOKING
// Owner Admin / Superadmin
// ==========================================
export const approveBooking = async (req, res) => {
  try {
    const booking = await bookingService.approveBookingService(
      req.params.id,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Booking approved successfully",
      booking,
    });
  } catch (error) {
    return res.status(
      error.message === "Booking not found" ? 404 : 400
    ).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// CONFIRM BOOKING (after payment)
// ==========================================
export const confirmBooking = async (req, res) => {
  try {
    const booking = await bookingService.confirmBookingService(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Booking confirmed successfully",
      booking,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// START TRIP
// ==========================================
export const startBooking = async (req, res) => {
  try {
    const booking = await bookingService.startBookingService(
      req.params.id,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Trip started successfully",
      booking,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// COMPLETE TRIP
// ==========================================
export const completeBooking = async (req, res) => {
  try {
    const booking = await bookingService.completeBookingService(
      req.params.id,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Trip completed successfully",
      booking,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// CANCEL BOOKING
// ==========================================
export const cancelBooking = async (req, res) => {
  try {
    const booking = await bookingService.cancelBookingService(
      req.params.id,
      req.user,
      req.body.cancelReason
    );

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    return res.status(
      error.message === "Booking not found" ? 404 : 400
    ).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// USER BOOKINGS
// ==========================================
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getUserBookingsService(
      req.user.id,
      req.query
    );

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// OWNER BOOKINGS
// Vehicles created by owner/admin
// ==========================================
export const getVehicleBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getVehicleBookingsService(
      req.user.id,
      req.query
    );

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET SINGLE BOOKING
// ==========================================
export const getBookingById = async (req, res) => {
  try {
    const booking = await bookingService.getBookingByIdService(
      req.params.id,
      req.user
    );

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    return res.status(
      error.message === "Booking not found" ? 404 : 403
    ).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// EXPIRE PENDING BOOKINGS (Manual Trigger)
// ==========================================
export const expireBookings = async (req, res) => {
  try {
    const result = await bookingService.expireBookingsService();

    return res.status(200).json({
      success: true,
      message: "Expired pending bookings updated",
      modifiedCount: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// SOFT DELETE BOOKING
// ==========================================
export const deleteBooking = async (req, res) => {
  try {
    await bookingService.deleteBookingService(
      req.params.id,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    return res.status(
      error.message === "Booking not found" ? 404 : 400
    ).json({
      success: false,
      message: error.message,
    });
  }
};