import cron from "node-cron";

import { autoExpireBookingsService } from "../booking.services.js";

cron.schedule("*/5 * * * *", async () => { // every 5 mins
 
    await autoExpireBookingsService();

});