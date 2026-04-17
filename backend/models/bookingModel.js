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
      enum: ["pending", "approved", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true, // ✅ adds createdAt & updatedAt
  },
);

export default mongoose.model("Booking", bookingSchema);
