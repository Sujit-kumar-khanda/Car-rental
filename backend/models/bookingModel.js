import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    // 🧾 Custom Booking ID (user-friendly)
    bookingId: {
      type: String,
      unique: true,
    },

    // 🔗 User Reference
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔗 Vehicle Reference
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    // 📅 Booking Dates
    startDate: {
      type: Date,
      required: true,
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

    // 💰 Total Price
    totalPrice: {
      type: Number,
      required: true,
    },

    // 📊 Booking Status
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
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
  },
  {
    timestamps: true, // ✅ adds createdAt & updatedAt
  },
);


bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ vehicle: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingId: 1 });

export default mongoose.model("Booking", bookingSchema);


