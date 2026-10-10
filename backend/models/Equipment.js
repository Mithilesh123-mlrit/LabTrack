// LabTrack - Equipment model
const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema(
  {
    equipmentId: {
      type: String,
      required: [true, "Equipment ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, "Equipment name is required"],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: "General",
    },
    laboratory: {
      type: String,
      required: [true, "Laboratory is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ["Available", "In Use", "Maintenance"],
        message: "Status must be Available, In Use, or Maintenance",
      },
      default: "Available",
    },
    quantity: {
      type: Number,
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },
    purchaseDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model("Equipment", equipmentSchema);