import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value >= this.startDate;
        },
        message:
          "End date must be after start date",
      },
    },

    year: {
      type: Number,
      required: true,
    },

    surgeType: {
      type: String,
      enum: ["multiplier", "flat"],
      default: "multiplier",
    },

    // multiplier: 1.5 => 50% extra
    // flat: 500 => +500 rupees
    surgeValue: {
      type: Number,
      required: true,
      min: 0,
    },

    applicableVehiclesSegments: [
      {
        type: String,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

holidaySchema.index({
  startDate: 1,
  endDate: 1,
  isActive: 1,
});

export default mongoose.model("Holiday", holidaySchema );