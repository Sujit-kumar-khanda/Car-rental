import Coupon from "./coupon.model.js";

export const getAvailableCouponsService = async () => {
  const now = new Date();

  return Coupon.find({
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now },
  }).select(
    "code description discountType discountValue minimumBookingAmount maximumDiscountAmount validUntil",
  );
};



export const applyCouponService = async (code, bookingAmount) => {
  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    throw new Error("Invalid coupon");
  }

  const now = new Date();

  if (coupon.validFrom && coupon.validFrom > now) {
    throw new Error("Coupon not active yet");
  }

  if (coupon.validUntil && coupon.validUntil < now) {
    throw new Error("Coupon expired");
  }

  if (bookingAmount < coupon.minimumBookingAmount) {
    throw new Error(
      `Minimum booking amount is ₹${coupon.minimumBookingAmount}`,
    );
  }

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    throw new Error("Coupon usage limit exceeded");
  }

  let discount = 0;

  if (coupon.discountType === "percentage") {
    discount = (bookingAmount * coupon.discountValue) / 100;

    if (coupon.maximumDiscountAmount) {
      discount = Math.min(discount, coupon.maximumDiscountAmount);
    }
  } else {
    discount = coupon.discountValue;
  }

  const finalAmount = bookingAmount - discount;

  return {
    couponId: coupon._id,
    code: coupon.code,
    discount,
    finalAmount,
  };
};
