import Holiday from "../models/Holiday.js";

export const calculatePrice = async (
  vehicle,
  startDate,
  endDate,
  bookingType,
) => {
  let total = 0; // total price paid by customer
  let surgeAmount = 0; // amount added due to holidays/weekends

  // load all active holidays from Holiday collection
  const holidays = await Holiday.find({ isActive: true }).lean(); // lean() for faster read-only queries

  let current = new Date(startDate); // start from booking start date

  // loop through each hour/day in the booking period
  while (current < endDate) {
    // base price for this hour/day
    let basePrice =
      bookingType === "hourly" ? vehicle.pricePerHour : vehicle.pricePerDay;

    // check if current date falls within any active holiday
    const holiday = holidays.find(
      (h) => current >= new Date(h.startDate) && current <= new Date(h.endDate),
    );

    let finalPrice = basePrice;

    if (holiday) {
      if (holiday.surgeType === "multiplier") {
        const surged = basePrice * holiday.surgeValue; // e.g. 1.5x = 50% increase
        surgeAmount += surged - basePrice;
        finalPrice = surged;
      } else {
        surgeAmount += holiday.surgeValue;
        finalPrice = basePrice + holiday.surgeValue;
      }
    }

    total += finalPrice;

    // It creates a new copy of the date object to avoid mutating the original startDate/endDate objects.
    // This is important because Date objects are mutable in JavaScript, and we don't want to accidentally change the input parameters.
    current = new Date(current.getTime());

    if (bookingType === "hourly") {
      current.setHours(current.getHours() + 1); // increment by 1 hour
    } else {
      current.setDate(current.getDate() + 1); // increment by 1 day
    }
  }

  return {
    totalPrice: Math.round(total),
    surgeAmount: Math.round(surgeAmount),
  };
};
