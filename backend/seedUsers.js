// LabTrack - Seed script: creates sample users (one per role)
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const sampleUsers = [
  { name: "Admin User", email: "admin@labtrack.edu", password: "Admin@123", role: "admin" },
  { name: "Lab Assistant", email: "assistant@labtrack.edu", password: "Assist@123", role: "assistant" },
  { name: "Student User", email: "student@labtrack.edu", password: "Student@123", role: "student" },
];

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    await User.deleteMany({});

    // We create users one by one with User.create(), because insertMany()
    // skips the pre-save hook, which means passwords would NOT be hashed.
    for (const data of sampleUsers) {
      await User.create(data);
      console.log("Created " + data.role + ": " + data.email);
    }
  } catch (error) {
    console.error("Seeding users failed: " + error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Done");
  }
}

seedUsers();