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
      validate: {
        validator: function (value) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const input = new Date(value);
          input.setHours(0, 0, 0, 0);

          return input >= today;
        },
        message: "Start date cannot be in the past",
      },
    },

    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: "End date must be after start date",
      },
    },
    bookingType: {
      type: String,
      enum: ["hourly", "daily"],
      default: "daily",
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
        "confirmed",
        "ongoing",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    expiresAt: Date, // ⏰ Booking expiration for pending bookings
    isExpired:{
      type: Boolean,
      default:false
    },

    // 💳 Payment Details
    payment: {
      paymentId: String,
      orderId: String, // for Razorpay or similar gateways
      method: {
        type: String,
        enum: ["card", "upi", "netbanking", "cash"],
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      paidAt: Date,
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
    
  },
  {
    timestamps: true, // ✅ adds createdAt & updatedAt
  },
);


bookingSchema.pre("save", async function (next) {

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

  // Set expiration for pending bookings (e.g. 24 hours )
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }else{
    this.isExpired = true;
  }
  next();
});



export default mongoose.model("Booking", bookingSchema);
