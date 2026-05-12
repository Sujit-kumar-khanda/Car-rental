import Holiday from "../../holiday/holiday.model.js";
import { BOOKING_PRICING } from "../booking.constants.js";
import { calculatePrice } from "../pricingService.js";

export const calculateBookingPrice = async ({
  vehicle,
  start,
  end,
  bookingType,
  pickupLocation,
}) => {
  // =====================================
  // BASE PRICE
  // =====================================

  const { totalPrice } = await calculatePrice(
    vehicle,
    start,
    end,
    bookingType
  );

  let basePrice = totalPrice;

  let surgeAmount = 0;

  // =====================================
  // HOLIDAY SURGE
  // =====================================

  const holiday = await Holiday.findOne({
    isActive: true,
    startDate: { $lte: start },
    endDate: { $gte: start },
  });

  if (holiday) {
    if (holiday.surgeType === "multiplier") {
      const surgedPrice = Math.round(
        basePrice * holiday.surgeValue
      );

      surgeAmount = surgedPrice - basePrice;

      basePrice = surgedPrice;
    } else {
      surgeAmount = holiday.surgeValue;

      basePrice += holiday.surgeValue;
    }
  }

  // =====================================
  // TAX
  // =====================================

  const tax = Math.round(
    basePrice * BOOKING_PRICING.TAX_PERCENT
  );

  // =====================================
  // EXTRA CHARGES
  // =====================================

  let extraCharges = 0;

  // pickup charge
  if (pickupLocation?.address) {
    extraCharges +=
      BOOKING_PRICING.PICKUP_CHARGE;
  }

  // night charge
  const startHour = start.getHours();

  const isNightBooking =
    startHour >=
      BOOKING_PRICING.NIGHT_START_HOUR ||
    startHour <
      BOOKING_PRICING.NIGHT_END_HOUR;

  if (isNightBooking) {
    extraCharges +=
      BOOKING_PRICING.NIGHT_CHARGE;
  }

  // =====================================
  // FINAL PRICE
  // =====================================

  const finalPrice = Math.round(
    basePrice + tax + extraCharges
  );

  return {
    basePrice,
    surgeAmount,
    tax,
    extraCharges,
    finalPrice,
  };
};