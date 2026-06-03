import mongoose from "mongoose";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      unique: true,
      index: true,
      required: true,
      trim: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
      index: true,
    },

    // approval flow

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: Date,

    // Location details

    pickupLocation: {
      address: {
        type: String,
        trim: true,
      },

      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },

        coordinates: {
          type: [Number], // [lng, lat]
          default: [0, 0],
        },
      },
    },

    dropLocation: {
      address: {
        type: String,
        trim: true,
      },

      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },

        coordinates: {
          type: [Number],
          default: [0, 0],
        },
      },
    },

    // Customer details

    customerDetails: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true, maxlength: 15 },
    },

    //Vehicle snapshot

    vehicleSnapshot: {
      name: String,
      brand: String,
      pricePerDay: Number,
      pricePerHour: Number,
      image: String,
    },

    // Booking time

    startDate: {
      type: Date,
      required: true,
      index: true,
    },

    endDate: {
      type: Date,
      required: true,
      index: true,
    },

    bookingType: {
      type: String,
      enum: ["hourly", "daily"],
      required: true,
    },

    duration: {
      type: Number,
      min: 1,
    },

    // pricing details

    pricePaidByCustomer: {
      type: Number,
      required: true,
      min: 0,
    },

    priceBreakdown: {
      basePrice: {
        type: Number,
        default: 0,
      },

      tax: {
        type: Number,
        default: 0,
      },

      discount: {
        type: Number,
        default: 0,
      },

      extraCharges: {
        type: Number,
        default: 0,
      },

      surgeAmount: {
        type: Number,
        default: 0,
      },

      finalPrice: {
        type: Number,
        default: 0,
      },
    },

    // Booking status

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "confirmed",
        "ongoing",
        "completed",
        "cancelled",
        "expired",
        "rejected",
      ],
      default: "pending",
      index: true,
    },

  

    //Security deposit

    securityDeposit: {
      amount: {
        type: Number,
        default: 0,
      },

      paymentMethod: {
        type: String,
        enum: [
          "credit_card",
          "debit_card",
          "upi",
          "netbanking",
          "wallet",
          "cash",
        ],
      },

      transactionId: String,

      status: {
        type: String,
        enum: [
          "pending",
          "held",
          "returned",
          "deducted",
          "partially_returned",
          "release_pending",
        ],
        default: "pending",
      },

      collectedAt: Date,

      deductionAmount: {
        type: Number,
        default: 0,
      },

      deductionReason: {
        type: String,
        trim: true,
      },

      deductedAt: Date,

      refundAmount: {
        type: Number,
        default: 0,
      },

      returnedAt: Date,
    },

    //Payment

    payment: {
      paymentId: String,

      orderId: String,

      method: {
        type: String,
        enum: [
          "credit_card",
          "debit_card",
          "upi",
          "netbanking",
          "wallet",
          "cash",
        ],
      },

      amount: {
        type: Number,
        default: 0,
      },

      currency: {
        type: String,
        default: "INR",
      },

      status: {
        type: String,
        enum: [
          "pending",
          "paid",
          "failed",
          "partially_refunded",
          "refunded",
          "refund_pending",
        ],
        default: "pending",
      },

      paidAt: Date,

      refundAmount: {
        type: Number,
        default: 0,
      },

      refundedAt: Date,
    },

    // Otp verification

    pickupOTP: String,

    dropOTP: String,

    // confirmation
    confirmedAt: Date,
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Cancellation

    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    cancelledByRole: {
      type: String,
      enum: ["user", "vendor", "admin"],
    },

    cancelledAt: Date,

    cancelReason: {
      type: String,
      trim: true,
    },

    //Completion

    completedAt: Date,

    //Auto expiry
    expiresAt: Date,

    // Activity logs

    activityLogs: [
      {
        action: String,

        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Soft delete

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ vehicle: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ status: 1 });

// Geospatial index for map/location-based queries
// Helps in:
// - finding nearby locations
// - distance calculations
// - geo filtering using MongoDB geospatial operators
bookingSchema.index({
  "pickupLocation.location": "2dsphere",
});

bookingSchema.index({
  "dropLocation.location": "2dsphere",
});

// TTL INDEX (Use for hard delete of expiry documents automatically after expiry)
// bookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

bookingSchema.pre("save", function (next) {
  try {
    // GENERATE BOOKING NUMBER
    if (!this.bookingNumber) {
      this.bookingNumber = `BK-${nanoid()}`;
    }

    // DATE VALIDATION
    if (this.endDate <= this.startDate) {
      return next(new Error("End date must be after start date"));
    }

    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model("Booking", bookingSchema);
