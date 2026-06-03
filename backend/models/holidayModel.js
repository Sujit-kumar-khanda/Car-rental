import { mongo } from "mongoose";
import {User} from "./bookingModel.js";
const holidaySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    year: { type: Number, required: true },
    surgeType: {
      type: String,
      enum: ["multiplier", "flat"],
      default: "multiplier",
    },
    // For multiplier: 1.5 means 50% increase, for flat: 20 means $20 increase
    surgeValue: {
      type: Number,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Holiday", holidaySchema);
