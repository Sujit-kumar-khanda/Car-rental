import express from "express";
import { razorpayWebhookController } from "./rozarpay.webhook.controller.js";

const router = express.Router();

router.post(
  "/razorpay",
  razorpayWebhookController,
);

export default router;