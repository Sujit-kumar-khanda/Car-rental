export const getAllPaymentsService = async (queryParams) => {
  const { page = 1, limit = 10, status, method, bookingNumber } = queryParams;

  const query = {
    isDeleted: false,
  };

  if (status) {
    query["payment.status"] = status;
  }

  if (method) {
    query["payment.method"] = method;
  }

  if (bookingNumber) {
    query.bookingNumber = {
      $regex: bookingNumber,
      $options: "i",
    };
  }

  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    Booking.find(query)
      .select("bookingNumber payment securityDeposit createdAt")
      .populate("user", "name email")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(Number(limit)),

    Booking.countDocuments(query),
  ]);

  return {
    payments,
    total,
  };
};

export const getPaymentDetailsService = async (bookingId) => {
  const booking = await Booking.findById(bookingId)
    .populate("user", "name email phone")
    .populate("vehicle", "name brand model");

  if (!booking) {
    throw new Error("Payment not found");
  }

  return booking;
};

export const getRefundPendingService = async () => {
  return Booking.find({
    "payment.status": "refund_pending",
    isDeleted: false,
  })
    .populate("user", "name email")
    .populate("vehicle", "name brand")
    .sort({
      updatedAt: -1,
    });
};

export const retryRefund = async (req, res) => {
  try {
    const booking = await processBookingRefund(req.params.bookingId);

    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      data: booking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPaymentStatsService = async () => {
  const [
    totalRevenue,
    totalRefunds,
    paidCount,
    refundedCount,
    refundPendingCount,
  ] = await Promise.all([
    Booking.aggregate([
      {
        $match: {
          "payment.status": "paid",
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$payment.amount",
          },
        },
      },
    ]),

    Booking.aggregate([
      {
        $match: {
          "payment.status": "refunded",
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$payment.refundAmount",
          },
        },
      },
    ]),

    Booking.countDocuments({
      "payment.status": "paid",
    }),

    Booking.countDocuments({
      "payment.status": "refunded",
    }),

    Booking.countDocuments({
      "payment.status": "refund_pending",
    }),
  ]);

  return {
    totalRevenue: totalRevenue[0]?.total || 0,

    totalRefunds: totalRefunds[0]?.total || 0,

    paidBookings: paidCount,

    refundedBookings: refundedCount,

    pendingRefunds: refundPendingCount,
  };
};
