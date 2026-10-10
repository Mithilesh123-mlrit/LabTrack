// LabTrack - Equipment routes (full CRUD, write routes protected)
const express = require("express");
const mongoose = require("mongoose");
const Equipment = require("../models/Equipment");
const { requireLogin, requireRole } = require("../middleware/auth");

const router = express.Router();

// Only admins and lab assistants may change equipment
const canManage = [requireLogin, requireRole("admin", "assistant")];

const allowedFields = [
  "equipmentId",
  "name",
  "category",
  "laboratory",
  "status",
  "quantity",
  "purchaseDate",
  "notes",
];

function pickFields(body) {
  const data = {};
  allowedFields.forEach(function (field) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  });
  return data;
}

router.param("id", function (req, res, next, id) {
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid equipment id" });
  }
  next();
});

// GET /api/equipment  ->  list all (public)
router.get("/", async function (req, res, next) {
  try {
    const filter = {};
    if (typeof req.query.status === "string") {
      filter.status = req.query.status;
    }
    const items = await Equipment.find(filter).sort({ equipmentId: 1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

// GET /api/equipment/:id  ->  get one (public)
router.get("/:id", async function (req, res, next) {
  try {
    const item = await Equipment.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
});

// POST /api/equipment  ->  create (admin, assistant)
router.post("/", canManage, async function (req, res, next) {
  try {
    const item = await Equipment.create(pickFields(req.body));
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

// PUT /api/equipment/:id  ->  update (admin, assistant)
router.put("/:id", canManage, async function (req, res, next) {
  try {
    const item = await Equipment.findByIdAndUpdate(
      req.params.id,
      pickFields(req.body),
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/equipment/:id  ->  delete (admin, assistant)
router.delete("/:id", canManage, async function (req, res, next) {
  try {
    const item = await Equipment.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    res.json({ message: "Equipment deleted", id: item._id });
  } catch (error) {
    next(error);
  }
});

module.exports = router;