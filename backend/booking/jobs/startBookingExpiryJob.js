import cron from "node-cron";
import { autoExpireBookingsService }
from "../booking/booking.service.js";

// Exiire pending booking quickly
export const startBookingExpiryJob = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      const expiredCount =
        await autoExpireBookingsService();

      console.log(
        `⏰ Expired bookings cleaned: ${expiredCount}`
      );
    } catch (error) {
      console.log(
        "Cron error:",
        error.message
      );
    }
  });
};