export const getAvailableCoupons = async (req, res) => {
  try {
    const coupons = await couponService.getAvailableCouponsService();

    res.status(200).json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const applyCoupon = async (req, res) => {
  try {
    const { code, bookingAmount  } = req.body;

    const result = await couponService.applyCouponService(code, bookingAmount);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
