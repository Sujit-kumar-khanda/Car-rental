import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    // 🔹 Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
      index: true, // for faster search by brand
    },
    model: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    year: {
      type: Number,
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 1, // allow next year's models
    },

    // 🚗 Type (IMPORTANT)
    type: {
      type: String,
      enum: ["Car", "Bike"],
      required: true,
    },

    // 🖼️ Images
    images: [
      {
        type: String, // multiple image URLs
      },
    ],

    color: {
      type: String,
      trim: true,
      default: "",
    },

    // 🚀 Segment (NEW)
    segment: {
      type: String,
      enum: [
        "Economy",
        "Everyday",
        "Premium",
        "Luxury",
        "Sport",
        "Off-road",
        "Muscle",
      ],
      default: "Everyday",
    },

    // 🛠️ Features (important ⭐)
    features: [
      {
        type: String, // e.g. "AC", "Bluetooth", "GPS"
      },
    ],

    // ⚙️ Specifications
    fuelType: {
      type: String,
      enum: ["Petrol", "Diesel", "Electric", "Hybrid"],
      required: true,
    },
    transmission: {
      type: String,
      enum: ["Manual", "Automatic"],
    },
    seats: {
      type: Number,
      required: function () {
        return this.type === "Car"; // only required for cars
      },
    },
    mileage: {
      type: String, // e.g. "18 km/l"
    },

    // 📊 Availability
    status: {
      type: String,
      enum: ["active", "inactive", "interrupted"],
      default: "active",
    },

    isAvailable: {
      type: String,
      default: true,
    },

    // 💰 Pricing
    pricePerDay: {
      type: Number,
      required: true,
    },
    pricePerHour: {
      type: Number,
    },
    securityDeposit: {
      type: Number,
      default: 0,
      min: 0,
    },

    // 📍 Location
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    state: {
      type: String,
      trim: true,
      default: "",
    },

    pickupAddress: {
      type: String,
      trim: true,
      default: "",
    },

    // ⭐ Rating & Reviews
    rating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },

    // total trips
    totalTrips: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Description
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    // 🏷️ Category
    category: {
      type: String,
      required: true,
    },

    // 🧑‍💼 Admin Info
    Owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    // Approval Flow
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },

    // 📅 Timestamps
  },
  {
    timestamps: true,
  },
);

// Fast listing query indexes
vehicleSchema.index({
  city: 1,
  type: 1,
  category: 1,
  isAvailable: 1,
  approvalStatus: 1,
});

export default mongoose.model("Vehicle", vehicleSchema);
