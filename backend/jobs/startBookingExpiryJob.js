import cron from "node-cron";
import Booking from "../models/bookingModel.js";

// Exipe pending booking quickly
export const startBookingExpiryJob = () => {
  cron.schedule("*/5 * * * *", async () => { // run every 5 minutes
    try {
      await Booking.updateMany(
        {
          status: "pending",
          expiresAt: { $lt: new Date() },
        },
        {
          $set: {
            status: "cancelled",
            cancelReason: "Booking expired",
            cancelledAt: new Date(),
          },
        }
      );

      console.log("⏰ Expired bookings cleaned");
    } catch (error) {
      console.log("Cron error:", error.message);
    }
  });
};