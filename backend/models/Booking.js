// LabTrack - Booking model
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: [true, "Equipment is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
      validate: {
        validator: function (value) {
          return !this.startTime || value > this.startTime;
        },
        message: "End time must be after start time",
      },
    },
    purpose: {
      type: String,
      required: [true, "Purpose is required"],
      trim: true,
      maxlength: [200, "Purpose must be 200 characters or fewer"],
    },
    status: {
      type: String,
      enum: {
        values: ["Pending", "Approved", "Rejected", "Cancelled"],
        message: "Invalid booking status",
      },
      default: "Pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewNote: {
      type: String,
      trim: true,
      maxlength: [200, "Note must be 200 characters or fewer"],
      default: "",
    },
  },
  { timestamps: true }
);

// Makes the "is this slot taken?" search fast
bookingSchema.index({ equipment: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model("Booking", bookingSchema);