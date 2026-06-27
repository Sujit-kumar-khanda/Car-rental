export const getAllPayments = async (
  req,
  res,
) => {
  try {
    const result =
      await paymentService.getAllPaymentsService(
        req.query,
      );

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

export const getPaymentDetails =
  async (req, res) => {
    try {
      const payment =
        await paymentService.getPaymentDetailsService(
          req.params.bookingId,
        );

      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      res.status(
        error.message ===
        "Payment not found"
          ? 404
          : 400,
      ).json({
        success: false,
        message:
          error.message,
      });
    }
  };

  export const getRefundPending =
  async (req, res) => {
    try {
      const payments =
        await paymentService.getRefundPendingService();

      res.status(200).json({
        success: true,
        data: payments,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }
  };

  export const retryRefund =
  async (req, res) => {
    try {
      const booking =
        await processBookingRefund(
          req.params.bookingNumber,
        );

      res.status(200).json({
        success: true,
        message:
          "Refund processed successfully",
        data: booking,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }
  };

  export const getPaymentStats =
  async (req, res) => {
    try {
      const stats =
        await paymentService.getPaymentStatsService();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }
  };