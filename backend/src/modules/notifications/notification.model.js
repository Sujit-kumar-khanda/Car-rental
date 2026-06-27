import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "booking",
        "payment",
        "review",
        "security_deposit",
        "system",
      ],
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model(
  "Notification",
  notificationSchema,
);