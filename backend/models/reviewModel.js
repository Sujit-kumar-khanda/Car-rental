import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    // 👤 User who gave review
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🚗 Vehicle being reviewed
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    booking:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Booking"
  },
    // ⭐ Rating (1 to 5)
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // 💬 Comment (optional)
    comment: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

reviewSchema.index({ user:1, vehicle:1 }, { unique:true });
reviewSchema.index({ vehicle:1, createdAt:-1 });

export default mongoose.model("Review", reviewSchema);
