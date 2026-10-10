// LabTrack - Express server (Step 7)

// 1. Load variables from .env into process.env (must be first)
require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const session = require("express-session");

const connectDB = require("./config/db");
const equipmentRoutes = require("./routes/equipment");
const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/bookings");
const statsRoutes = require("./routes/stats");

// Stop early with a clear message if the session secret is missing
if (!process.env.SESSION_SECRET) {
  console.error("SESSION_SECRET is missing in .env");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// 2. Security headers (helmet)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "upgrade-insecure-requests": null,
      },
    },
  })
);

// 3. Allow cross-origin requests
app.use(cors());

// 4. Read JSON sent in request bodies
app.use(express.json());

// 5. Serve the frontend folder as static files
const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath));

// 6. Sessions (login state is remembered with a cookie)
app.use(
  session({
    name: "labtrack.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // only create a session when we put something in it
    cookie: {
      httpOnly: true, // JavaScript in the page cannot read the cookie
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      maxAge: 1000 * 60 * 60 * 2, // 2 hours
    },
  })
);

// 7. API routes
app.get("/api/health", function (req, res) {
  res.json({
    status: "ok",
    app: "LabTrack API",
    time: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/stats", statsRoutes);

// 8. Any unknown /api route returns a JSON 404
app.use("/api", function (req, res) {
  res.status(404).json({ message: "API route not found" });
});

// 9. Error handler (turns common errors into clear JSON responses)
app.use(function (err, req, res, next) {
  // Invalid JSON in the request body
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Request body contains invalid JSON" });
  }

  // Mongoose validation failed (missing field, wrong enum value, etc.)
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map(function (e) {
      return e.message;
    });
    return res.status(400).json({ message: "Validation failed", errors: messages });
  }

  // Duplicate value in a unique field (equipmentId, email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "value";
    return res.status(409).json({ message: "Duplicate " + field + ": it already exists" });
  }

  // Anything else is an unexpected server error
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

// 10. Connect to MongoDB first, then start the server
connectDB().then(function () {
  app.listen(PORT, function () {
    console.log("LabTrack server running at http://localhost:" + PORT);
  });
});