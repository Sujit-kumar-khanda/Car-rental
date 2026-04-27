import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // 🔹 Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"]
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Don't return password by default
    },

    // 🔐 Role-Based Access
    role: {
      type: String,
      enum: ["user", "vendor", "superadmin"],
      default: "user",
    },

    // ✅ Vendor Approval by superadmin
    vendorApprovalStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },

    // 📞 Contact Info
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/],
    },

    // 🖼️ Profile
    profileImage: {
      type: String,
      default: "",
      trim: true,
    },

    // Date of brith coz age will increase year by year and we can easily calculate the age of user by using date of birth
    dateOfBirth: Date,

    // 📍 Address
    address: {
      street: { type: String, trim: true, default: "" },
      city: { type: String, trim: true, default: "" },
      state: { type: String, trim: true, default: "" },
      country: { type: String, trim: true, default: "" },
      zipCode: { type: String, trim: true, default: "" },
    },

    drivingLicense: {
      number: { type: String, trim: true, default: "" },
      sparese: true,
      verified: {
        type: Boolean,
        default: false,
      },
      expiryDate: Date,
      image: {
        type: String,
        default: "",
      },
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: true
    },

    lastLoginAt: Date

  },

  {
    timestamps: true,
    versionKey: false,
  },


);

userSchema.index({
  email: 1,
  role: 1,
});

export default mongoose.model("User", userSchema);
