import mongoose from "mongoose";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, unique: true, index: true },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: Date,

    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
      index: true,
    },

    pickupLocation: {
      address: String,
      lat: Number,
      lng: Number,
    },

    dropLocation: {
      address: String,
      lat: Number,
      lng: Number,
    },

    customerDetails: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true, maxlength: 15 },
    },

    vehicleSnapshot: {
      name: String,
      brand: String,
      pricePerDay: Number,
      pricePerHour: Number,
      image: String,
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    bookingType: {
      type: String,
      enum: ["hourly", "daily"],
      required: true,
    },

    duration: {
      type: Number,
      min: 1
    },

    pricePaidByCustomer: {
      type: Number,
      required: true,
    },

    priceBreakdown: {
      finalPrice: Number,
      basePrice: Number,
      tax: Number,
      discount: Number,
      extraCharges: Number,
      surgeAmount: Number,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "confirmed",
        "ongoing",
        "completed",
        "cancelled",
        "interrupted",
      ],
      default: "pending",
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    expiresAt: Date,

    payment: {
      paymentId: String,
      orderId: String,
      method: {
        type: String,
        enum: ["card", "upi", "netbanking", "cash"],
      },
      amount: Number,
      currency: { type: String, default: "INR" },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      paidAt: Date,
      refundAmount: Number,
      refundedAt: Date,
    },

    cancelledAt: Date,
    cancelReason: String,

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ vehicle: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ status: 1 });

bookingSchema.pre("save", async function (next) {
  try {
    if (!this.bookingId) {
      this.bookingId = `BK-${nanoid()}`;
    }

    if (this.endDate <= this.startDate) {
      return next(new Error("End date must be after start date"));
    }

    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model("Booking", bookingSchema);