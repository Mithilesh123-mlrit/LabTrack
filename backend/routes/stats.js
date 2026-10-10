// LabTrack - Dashboard statistics (public: only counts, no personal data)
const express = require("express");
const Equipment = require("../models/Equipment");
const Booking = require("../models/Booking");

const router = express.Router();

// GET /api/stats
router.get("/", async function (req, res, next) {
  try {
    const now = new Date();

    // All five counts run at the same time instead of one after another
    const results = await Promise.all([
      Equipment.countDocuments(),
      Equipment.countDocuments({ status: "Available" }),
      Equipment.countDocuments({ status: "In Use" }),
      Equipment.countDocuments({ status: "Maintenance" }),
      Booking.countDocuments({ status: "Approved", endTime: { $gt: now } }),
    ]);

    res.json({
      total: results[0],
      available: results[1],
      inUse: results[2],
      maintenance: results[3],
      activeBookings: results[4],
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;