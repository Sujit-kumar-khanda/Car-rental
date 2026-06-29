export const createCouponService = async (data, adminId) => {
  const existing = await Coupon.findOne({
    code: data.code.toUpperCase(),
  });

  if (existing) {
    throw new Error("Coupon already exists");
  }

  return Coupon.create({
    ...data,
    code: data.code.toUpperCase(),
    createdBy: adminId,
  });
};

export const getAllCouponsService = async () => {
  return Coupon.find()
    .sort({
      createdAt: -1,
    })
    .populate("createdBy", "name email");
};

export const getCouponDetailsService =
  async (couponId) => {
    const coupon =
      await Coupon.findById(
        couponId,
      );

    if (!coupon) {
      throw new Error(
        "Coupon not found",
      );
    }

    return coupon;
  };

  export const updateCouponService =
  async (
    couponId,
    updateData,
  ) => {
    const coupon =
      await Coupon.findByIdAndUpdate(
        couponId,
        updateData,
        {
          new: true,
          runValidators: true,
        },
      );

    if (!coupon) {
      throw new Error(
        "Coupon not found",
      );
    }

    return coupon;
  };

  export const toggleCouponService =
  async (couponId) => {
    const coupon =
      await Coupon.findById(
        couponId,
      );

    if (!coupon) {
      throw new Error(
        "Coupon not found",
      );
    }

    coupon.isActive =
      !coupon.isActive;

    await coupon.save();

    return coupon;
  };

  export const deleteCouponService =
  async (couponId) => {
    const coupon =
      await Coupon.findById(
        couponId,
      );

    if (!coupon) {
      throw new Error(
        "Coupon not found",
      );
    }

    await coupon.deleteOne();

    return true;
  };

  export const getCouponStatsService =
  async () => {
    const [
      totalCoupons,
      activeCoupons,
      inactiveCoupons
    ] = await Promise.all([
      Coupon.countDocuments(),

      Coupon.countDocuments({
        isActive: true,
      }),
        Coupon.countDocuments({
            isActive: false,
        }),
    ]);

    return {
      totalCoupons,
      activeCoupons,
      inactiveCoupons
    };
  };