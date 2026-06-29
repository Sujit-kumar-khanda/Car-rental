export const getAllBookings = async (req, res) => {
  try {
    const result = await bookingService.getAllBookingsService(req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


export const getBookingDetails = async (
  req,
  res,
) => {
  try {
    const booking =
      await bookingService.getBookingDetailsService(
        req.params.bookingId,
      );

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(
      error.message ===
      "Booking not found"
        ? 404
        : 400,
    ).json({
      success: false,
      message: error.message,
    });
  }
};