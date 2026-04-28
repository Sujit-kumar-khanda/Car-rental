import mongoose from "mongoose";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);

const bookingSchema = new mongoose.Schema(
  {
    // 🧾 Custom Booking ID (user-friendly)
    bookingId: {
      type: String,
      unique: true,
      index: true,
    },

    // 🔗 User Reference
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 🧑‍💼 Admin Approval
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: Date,

    // 🔗 Vehicle Reference
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
      index: true,
    },

    // 📍 Locations
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

    // 👤 Customer Details (snapshot at booking time)
    customerDetails: {
      name: String,
      email: String,
      phone: String,
    },
    // 🚗 Vehicle Details (snapshot at booking time for reference)
    vehicleSnapshot: {
      name: String,
      brand: String,
      pricePerDay: Number,
      pricePerHour: Number,
      image: String,
    },

    // 📅 Booking Dates
    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    bookingType: {
      type: String,
      enum: ["hourly", "daily"],
      required: true,
    },

    duration: {
      type: Number, // hours or days based on bookingType
    },

    // 💰 Total Price
    pricePaidByCustomer: {
      type: Number,
      required: true,
    },

    // 🧾 Detailed Price Breakdown
    priceBreakdown: {
      finalPrice: Number,
      basePrice: Number,
      tax: Number,
      discount: Number,
      extraCharges: Number,
      surgeAmount: Number, // 🔥 holiday/weekend surge
    },
    // 📊 Booking Status
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
<<<<<<< HEAD
        "cancelled",
        "completed",
        "rejected"
      ],
      default: "pending",
    },
    pickupAddress: String,
    dropAddress: String,

    securityDeposit: {
      type: Number,
      default: 0
    },

    cancelReason: {
      type: String,
      default: ""
    },
    approvedAt: Date,
    cancelledAt: Date,
    completedAt: Date
=======
        "confirmed",
        "ongoing",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    expiresAt: Date, // ⏰ Booking expiration for pending bookings

    // 💳 Payment Details
    payment: {
      paymentId: { type: String, index: true },
      orderId: { type: String, index: true },

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
    // 🚫 Cancellation Details
    cancelledAt: Date,
    cancelReason: String,
    refundAmount: Number,

    // 🗑️ Soft Delete Flag
    isDeleted: {
      type: Boolean,
      default: false,
    },
>>>>>>> fcd917f5f074572ca1e1775b1b972cf4ed75e951
  },
  {
    timestamps: true, // ✅ adds createdAt & updatedAt
  },
);

<<<<<<< HEAD

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ vehicle: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingId: 1 });
=======
bookingSchema.pre("save", async function (next) {
  try {
    // Generate unique bookingId if not already set
    if (!this.bookingId) {
      let id;
      let exists = true;

      while (exists) {
        id = `BK-${nanoid()}`;
        exists = await mongoose.models.Booking.findOne({ bookingId: id });
      }

      this.bookingId = id;
    }

    // 📅 Validations
    if (this.startDate < new Date()) {
      return next(new Error("Start date must be in the future"));
    }

    if (this.endDate <= this.startDate) {
      return next(new Error("End date must be after start date"));
    }

    // calculate booking type
    const diffMs = this.endDate - this.startDate;
    const diffHours = diffMs / (1000 * 60 * 60);

    this.bookingType = diffHours <= 12 ? "hourly" : "daily"; // ALWAYS auto-determine booking type

    //calculate duration
    this.duration =
      this.bookingType === "hourly"
        ? Math.max(1, Math.ceil(diffHours))
        : Math.max(1, Math.ceil(diffHours / 24));

    // minimum advance booking time validation
    // user cannot book a vehicle whose (startDate - bookingTime) < 30 minutes (daily Booking)
    // user cannot book a vehicle whose (startDate - bookingTime) < 15 minutes (hourly Booking)
    const minAdvanceTime =
      this.bookingType === "hourly"
        ? 15 * 60 * 1000 // 15 minutes
        : 30 * 60 * 1000; // 30 minutes

    if (this.startDate.getTime() - now.getTime() < minAdvanceTime) {
      throw new Error(
        `Booking must be at least ${
          this.bookingType === "hourly" ? "15 minutes" : "30 minutes"
        } before start time`,
      );
    }

    const now = new Date();

    // ⏱️ Expiry window based on booking type
    const bufferTime =
      this.bookingType === "hourly"
        ? 30 * 60 * 1000 // 30 min
        : 60 * 60 * 1000; // 1 hour

    // Option 1: give user time after booking creation
    const expiryFromNow = new Date(now.getTime() + bufferTime);

    // Option 2: must expire before trip starts (safe cutoff)
    const expiryBeforeStart = new Date(
      this.startDate.getTime() - 10 * 60 * 1000, // 10 min before start
    );

    // Final expiry = earlier of the two
    this.expiresAt =
      expiryFromNow < expiryBeforeStart ? expiryFromNow : expiryBeforeStart;

    next();
  } catch (err) {
    next(err);
  }
});
>>>>>>> fcd917f5f074572ca1e1775b1b972cf4ed75e951

export default mongoose.model("Booking", bookingSchema);


