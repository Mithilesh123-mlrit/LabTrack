// LabTrack - Seed script: puts sample equipment into MongoDB
require("dotenv").config();
const mongoose = require("mongoose");
const Equipment = require("./models/equipment");

const sampleEquipment = [
  { equipmentId: "EQ-001", name: "Compound Microscope", category: "Optical", laboratory: "Biology Lab", status: "Available", quantity: 10 },
  { equipmentId: "EQ-002", name: "Digital Balance", category: "Measurement", laboratory: "Chemistry Lab", status: "In Use", quantity: 4 },
  { equipmentId: "EQ-003", name: "Digital Oscilloscope", category: "Electronics", laboratory: "Electronics Lab", status: "Available", quantity: 6 },
  { equipmentId: "EQ-004", name: "Centrifuge", category: "Separation", laboratory: "Biology Lab", status: "Maintenance", quantity: 2, notes: "Rotor under repair" },
  { equipmentId: "EQ-005", name: "Spectrophotometer", category: "Analysis", laboratory: "Chemistry Lab", status: "Available", quantity: 3 },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    await Equipment.deleteMany({}); // clear old data
    const created = await Equipment.insertMany(sampleEquipment);
    console.log("Inserted " + created.length + " equipment items");
  } catch (error) {
    console.error("Seeding failed: " + error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Done");
  }
}

seed();