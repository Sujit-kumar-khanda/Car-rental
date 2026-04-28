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

    // 🚗 Type (IMPORTANT)
    type: {
      type: String,
      enum: ["Car", "Bike"],
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 💰 Pricing
    pricePerDay: {
      type: Number,
      required: true,
      min: 1,
    },
    pricePerHour: {
      type: Number,
      min: 1,
      default: null,
    },
    securityDeposit: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ⚙️ Specifications
    fuelType: {
      type: String,
      enum: ["Petrol", "Diesel", "Electric", "Hybrid"],
      required: true,
    },
    transmission: {
      type: String,
      enum: ["Manual", "Automatic"],
      default: null,
    },
    seats: {
      type: Number,
      min: 1,
      max: 9,
      required: function () {
        return this.type === "Car"; // only required for cars
      },
    },
    mileage: {
      type: String,
      trim: true,
      default: "", // e.g. "18 km/l"
    },
    color: {
      type: String,
      trim: true,
      default: "",
    },

    // 🖼️ Images
    images: [
      {
        type: String, // multiple image URLs
      },
    ],


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


    // 📍 Location
    // Location
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
      min: 1,
      max: 5,
      default: 0,

    },
    totalReviews: {
      type: Number,
      default: 0,
    },

    // 🏷️ Category
    category: {
      type: String,
      required: true,
    },

    // Availability
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },

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

    // Soft Delete
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
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

// Hide deleted vehicles automatically
vehicleSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

export default mongoose.model("Vehicle", vehicleSchema);
