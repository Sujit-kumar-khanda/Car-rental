export const createCoupon = async (req, res) => {
  try {
    const coupon = await couponService.createCouponService(
      req.body,
      req.user._id,
    );

    res.status(201).json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllCoupons =
  async (req, res) => {
    try {
      const coupons =
        await couponService.getAllCouponsService();

      res.status(200).json({
        success: true,
        data: coupons,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }
  };

  export const getCouponDetails =
  async (req, res) => {
    try {
      const coupon =
        await couponService.getCouponDetailsService(
          req.params.couponId,
        );

      res.status(200).json({
        success: true,
        data: coupon,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message:
          error.message,
      });
    }
  };

  export const updateCoupon =
  async (req, res) => {
    try {
      const coupon =
        await couponService.updateCouponService(
          req.params.couponId,
          req.body,
        );

      res.status(200).json({
        success: true,
        data: coupon,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }
  };

  export const toggleCoupon =
  async (req, res) => {
    try {
      const coupon =
        await couponService.toggleCouponService(
          req.params.couponId,
        );

      res.status(200).json({
        success: true,
        data: coupon,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }
  };

  export const deleteCoupon =
  async (req, res) => {
    try {
      await couponService.deleteCouponService(
        req.params.couponId,
      );

      res.status(200).json({
        success: true,
        message:
          "Coupon deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }
  };

  export const getCouponStats =
  async (req, res) => {
    try {
      const stats =
        await couponService.getCouponStatsService();

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