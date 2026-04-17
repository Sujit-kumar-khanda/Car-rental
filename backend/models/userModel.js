import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // 🔹 Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    // 🔐 Role-Based Access
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },

    // ✅ Vendor Approval by superadmin
    isApprovedVendor: {
      type: Boolean,
      default: false,
    },

    // 📞 Contact Info
    phone: {
      type: String,
    },

    // 🖼️ Profile
    profileImage: {
      type: String,
      default: "",
    },

    // 🎂 Age
    age: {
      type: Number,
    },

    // 📍 Address
    address: {
      type: String,
    },
    // 🚗 Driving License
    drivingLicense: {
      type: String,
      required: false, // Optional for now, can be required during booking
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("User", userSchema);
