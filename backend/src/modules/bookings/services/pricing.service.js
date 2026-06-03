import Holiday from "../models/holidayModel.js";
import { BOOKING_PRICING } from "../booking.constant.js";

export const calculatePrice = async (
  vehicle,
  startDate,
  endDate,
  bookingType,
  pickupLocation,
) => {

  if (
    bookingType !== "hourly" &&
    bookingType !== "daily"
  ) {
    throw new Error(
      "Invalid booking type"
    );
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) {
    throw new Error(
      "End date must be after start date"
    );
  }
  
  let basePrice = 0;
  let surgeAmount = 0;

  // fetch active holidays
  const rawHolidays = await Holiday.find({
    isActive: true,
    isDeleted: false,
  }).lean();

  // optimize holiday dates
  const holidays = rawHolidays.map((h) => ({
    ...h,
    start: new Date(h.startDate),
    end: new Date(h.endDate),
  }));

  let current = new Date(startDate);
  const end = new Date(endDate);

  // calculate base + surge pricing
  while (current < end) {
    const currentBasePrice =
      bookingType === "hourly" ? vehicle.pricePerHour : vehicle.pricePerDay;

    basePrice += currentBasePrice;

    // find matching holiday
    const holiday = holidays.find((h) => {
      const withinDate =
        current.getTime() >= h.start.getTime() &&
        current.getTime() <= h.end.getTime();

      // if no segments defined
      // apply to all vehicles
      const segmentAllowed =
        !h.applicableSegments?.length ||
        h.applicableSegments.includes(vehicle.segment);

      return withinDate && segmentAllowed;
    });

    if (holiday) {
      // multiplier surge
      if (holiday.surgeType === "multiplier") {
        const surged = currentBasePrice * holiday.surgeValue;

        surgeAmount += surged - currentBasePrice;
      } else {
        // fixed amount surge
        surgeAmount += holiday.surgeValue;
      }
    }

    // avoid mutating original date
    current = new Date(current);

    if (bookingType === "hourly") {
      current.setHours(current.getHours() + 1);
    } else {
      current.setDate(current.getDate() + 1);
    }
  }

  // subtotal before taxes/discounts
  const totalPrice = basePrice + surgeAmount;

  // =========================
  // EXTRA CHARGES
  // =========================

  let extraCharges = 0;

  // pickup charge
  if (pickupLocation?.address) {
    extraCharges += BOOKING_PRICING.PICKUP_EXTRA_CHARGE;
  }

  // night pickup charge
  const startHour = new Date(startDate).getHours();

  const isNightPickup = startHour >= 20 || startHour < 6;

  if (isNightPickup) {
    extraCharges += BOOKING_PRICING.NIGHT_EXTRA_CHARGE;
  }

  // =========================
  // DISCOUNT
  // =========================

  let discount = 0;

  if (surgeAmount > 0) {
    discount = Math.min(
      surgeAmount * BOOKING_PRICING.SURGE_DISCOUNT_PERCENTAGE,

      BOOKING_PRICING.MAX_SURGE_DISCOUNT,
    );
  }

  // =========================
  // TAX
  // =========================

  const tax = Math.round(totalPrice * BOOKING_PRICING.TAX_PERCENTAGE);

  // =========================
  // FINAL PRICE
  // =========================

  const finalPrice = Math.round(totalPrice + extraCharges + tax - discount);

  return {
    basePrice: Math.round(basePrice),

    surgeAmount: Math.round(surgeAmount),

    extraCharges: Math.round(extraCharges),

    discount: Math.round(discount),

    tax,

    finalPrice,
  };
};
