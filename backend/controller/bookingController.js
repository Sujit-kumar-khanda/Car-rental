import {
  createBookingService,
  approveBookingService,
  cancelBookingService,
  completeBookingService,
  getUserBookingsService,
  getAllBookingsService,
  getBookingByIdService,
  deleteBookingService,
} from "../services/bookingService.js";

// Create Booking (User Only)
export const createBooking = async (req, res) => {
  try {
    const booking = await createBookingService(req);

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Approve Booking (Admin Only)
export const approveBooking = async (req, res) => {
  try {
    const booking = await approveBookingService(req.params.id);

    res.json({
      message: "Booking approved",
      booking,
    });
  } catch (error) {
    res.status(
      error.message === "Booking not found" ? 404 : 400,
    ).json({ message: error.message });
  }
};

// Cancel Booking (User or Admin or superAdmin)
export const cancelBooking = async (req, res) => {
  try {
    const booking = await cancelBookingService(req);

    res.json({
      message: "Booking cancelled",
      booking,
    });
  } catch (error) {
    res.status(
      error.message === "Booking not found" ? 404 : 400,
    ).json({ message: error.message });
  }
};

// Complete Booking (Admin Only)
export const completeBooking = async (req, res) => {
  try {
    const booking = await completeBookingService(req.params.id);

    res.json({
      message: "Booking completed",
      booking,
    });
  } catch (error) {
    res.status(
      error.message === "Booking not found" ? 404 : 400,
    ).json({ message: error.message });
  }
};

// Get User's Bookings
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await getUserBookingsService(req.user.id);

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Vehicle's Bookings (admin only)
export const getVehicleBookings = async (req, res) => {
  try {
    const bookings = await getAllBookingsService();

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Booking by ID
export const getBookingById = async (req, res) => {
  try {
    const booking = await getBookingByIdService(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Booking
export const deleteBooking = async (req, res) => {
  try {
    await deleteBookingService(req.params.id);

    res.json({
      message: "Booking deleted successfully",
    });
  } catch (error) {
    res.status(
      error.message === "Booking not found" ? 404 : 400,
    ).json({ message: error.message });
  }
};

