import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    // 🔹 Basic Info
    name: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    model: {
      type: String,
    },
    year: {
      type: Number,
    },
    // 🚗 Type (IMPORTANT)
    type: {
      type: String,
      enum: ["Car", "Bike"],
      required: true,
    },

    // 💰 Pricing
    pricePerDay: {
      type: Number,
      required: true,
    },
    pricePerHour: {
      type: Number,
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

    // 🖼️ Images
    images: [
      {
        type: String, // multiple image URLs
      },
    ],

    // 📍 Location
    location: {
      type: String, // city or pickup location
      required: true,
    },

    // 📊 Availability
    isAvailable: {
      type: Boolean,
      default: true,
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

    // 📝 Description
    description: {
      type: String,
    },

    // 🏷️ Category
    category: {
      type: String,
      required: true,
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

    // 🧑‍💼 Admin Info
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // 📅 Timestamps
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Vehicle", vehicleSchema);
