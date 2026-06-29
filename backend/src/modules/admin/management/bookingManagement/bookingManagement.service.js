export const getAllBookingsService = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    status,
    paymentStatus,
    bookingNumber,
    startDate,
    endDate,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = queryParams;

  const query = {
    isDeleted: false,
  };

  if (status) {
    query.status = status;
  }

  if (paymentStatus) {
    query["payment.status"] = paymentStatus;
  }

  if (bookingNumber) {
    query.bookingNumber = {
      $regex: bookingNumber,
      $options: "i",
    };
  }

  if (startDate || endDate) {
    query.createdAt = {};

    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }

    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }
  }

  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate("user", "name email phone")
      .populate("vehicle", "name brand model")
      .sort({
        [sortBy]: sortOrder === "asc" ? 1 : -1,
      })
      .skip(skip)
      .limit(Number(limit)),

    Booking.countDocuments(query),
  ]);

  return {
    bookings,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getBookingDetailsService = async (bookingId) => {
  const booking = await Booking.findById(bookingId)
    .populate("user", "name email phone")
    .populate("vehicle", "name brand model registrationNumber")
    .populate("cancelledBy", "name role");

  if (!booking) {
    throw new Error("Booking not found");
  }

  return booking;
};
