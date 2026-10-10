// LabTrack - Booking routes
const express = require("express");
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Equipment = require("../models/Equipment");
const { requireLogin, requireRole } = require("../middleware/auth");

const router = express.Router();

// Every booking route needs a logged-in user
router.use(requireLogin);

// Which linked fields to fill in when sending bookings back
const populateFields = [
  { path: "equipment", select: "equipmentId name laboratory status" },
  { path: "user", select: "name email role" },
  { path: "reviewedBy", select: "name" },
];

function isStaff(user) {
  return user.role === "admin" || user.role === "assistant";
}

// Turns a text value into a Date, or returns null if it is not a valid date
function parseDate(value) {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

// Rejects ids that are not valid MongoDB ObjectIds
router.param("id", function (req, res, next, id) {
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid booking id" });
  }
  next();
});

// GET /api/bookings  ->  students see their own, staff see all
router.get("/", async function (req, res, next) {
  try {
    const filter = {};
    if (!isStaff(req.user)) {
      filter.user = req.user._id;
    }
    if (typeof req.query.status === "string") {
      filter.status = req.query.status;
    }
    const bookings = await Booking.find(filter)
      .populate(populateFields)
      .sort({ startTime: -1 });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/:id  ->  one booking (owner or staff)
router.get("/:id", async function (req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id).populate(populateFields);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    const isOwner = booking.user._id.toString() === req.user._id.toString();
    if (!isOwner && !isStaff(req.user)) {
      return res.status(403).json({ message: "You do not have permission to view this booking" });
    }
    res.json(booking);
  } catch (error) {
    next(error);
  }
});

// POST /api/bookings  ->  request a booking
router.post("/", async function (req, res, next) {
  try {
    const { equipment, startTime, endTime, purpose } = req.body;

    // 1. Check the input
    const errors = [];
    const start = parseDate(startTime);
    const end = parseDate(endTime);

    if (typeof equipment !== "string" || !mongoose.isValidObjectId(equipment)) {
      errors.push("A valid equipment id is required");
    }
    if (!start) errors.push("A valid start time is required");
    if (!end) errors.push("A valid end time is required");
    if (typeof purpose !== "string" || !purpose.trim()) {
      errors.push("Purpose is required");
    }
    if (start && start <= new Date()) {
      errors.push("Start time must be in the future");
    }
    if (start && end && end <= start) {
      errors.push("End time must be after start time");
    }
    if (errors.length) {
      return res.status(400).json({ message: "Validation failed", errors: errors });
    }

    // 2. The equipment must exist and not be under maintenance
    const item = await Equipment.findById(equipment);
    if (!item) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    if (item.status === "Maintenance") {
      return res.status(400).json({ message: "This equipment is under maintenance and cannot be booked" });
    }

    // 3. Double-booking check.
    //    Two time ranges overlap when each one starts before the other ends.
    //    Only Pending and Approved bookings block a slot.
    const clash = await Booking.findOne({
      equipment: item._id,
      status: { $in: ["Pending", "Approved"] },
      startTime: { $lt: end },
      endTime: { $gt: start },
    });
    if (clash) {
      return res.status(409).json({ message: "This equipment is already booked for that time" });
    }

    // 4. Save it. The user comes from the session, never from the request body.
    const booking = await Booking.create({
      equipment: item._id,
      user: req.user._id,
      startTime: start,
      endTime: end,
      purpose: purpose,
    });
    await booking.populate(populateFields);
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
});

// PUT /api/bookings/:id/review  ->  approve or reject (staff only)
router.put("/:id/review", requireRole("admin", "assistant"), async function (req, res, next) {
  try {
    const { status, reviewNote } = req.body;

    if (status !== "Approved" && status !== "Rejected") {
      return res.status(400).json({ message: "Status must be Approved or Rejected" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.status !== "Pending") {
      return res.status(400).json({ message: "Only pending bookings can be reviewed" });
    }

    booking.status = status;
    booking.reviewedBy = req.user._id;
    booking.reviewNote = typeof reviewNote === "string" ? reviewNote : "";
    await booking.save();
    await booking.populate(populateFields);
    res.json(booking);
  } catch (error) {
    next(error);
  }
});

// PUT /api/bookings/:id/cancel  ->  cancel (owner or staff)
router.put("/:id/cancel", async function (req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isOwner = booking.user.toString() === req.user._id.toString();
    if (!isOwner && !isStaff(req.user)) {
      return res.status(403).json({ message: "You do not have permission to cancel this booking" });
    }
    if (booking.status !== "Pending" && booking.status !== "Approved") {
      return res.status(400).json({ message: "Only pending or approved bookings can be cancelled" });
    }

    booking.status = "Cancelled";
    await booking.save();
    await booking.populate(populateFields);
    res.json(booking);
  } catch (error) {
    next(error);
  }
});

module.exports = router;