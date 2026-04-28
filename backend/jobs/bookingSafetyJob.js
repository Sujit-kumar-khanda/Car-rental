import cron from "node-cron";
import Booking from "../models/bookingModel.js";

/**
 * 🧠 BOOKING SAFETY JOB (HOURLY CRON)
 * ------------------------------------
 * This job runs every 1 hour and acts as a "backup system"
 * for booking expiry logic.
 *
 * WHY IT EXISTS:
 * 1. If the 5-minute cron fails (server crash, downtime, deployment),
 *    some expired bookings may NOT get updated.
 *
 * 2. This job ensures data consistency by re-checking ALL pending bookings
 *    that should already be expired.
 *
 * 3. Think of it as a "system repair tool" that fixes missed updates.
 */

export const startBookingSafetyJob = () => {
  cron.schedule("0 */1 * * *", async () => {
    try {
      const now = new Date();

      // 🔍 Find all bookings that should already be expired
      const result = await Booking.updateMany(
        {
          status: { $in: ["pending", "approved"] },
          expiresAt: { $lt: now },
          isDeleted: false
        },
        {
          $set: {
            status: "cancelled",
            cancelReason: "Safety job: missed expiry correction",
            cancelledAt: now,
          },
        }
      );

      console.log(
        `🧹 Safety Job Completed | Fixed: ${result.modifiedCount} bookings`
      );
    } catch (error) {
      console.log("❌ Safety Cron Error:", error.message);
    }
  });
};