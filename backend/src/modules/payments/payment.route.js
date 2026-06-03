import * as paymentController from './payment.controller.js';

import express from "express";

const router = express.Router();

router.post( "/create-order/:bookingNumber", paymentController.createPaymentOrder);
router.post("/collect-cash/:bookingNumber", paymentController.collectCashAndConfirmBooking);

export default router;