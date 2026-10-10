// LabTrack - Authentication routes
const express = require("express");
const User = require("../models/User");

const router = express.Router();

const COOKIE_NAME = "labtrack.sid";

// What we are allowed to send back about a user (never the password)
function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

// POST /api/auth/register  ->  create a student account
router.post("/register", async function (req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        message: "Validation failed",
        errors: ["Password must be at least 6 characters"],
      });
    }

    // The role is always "student" here. Any role sent by the client is ignored,
    // so nobody can register themselves as an admin.
    const user = await User.create({ name, email, password, role: "student" });
    res.status(201).json(publicUser(user));
  } catch (error) {
    next(error); // validation and duplicate-email errors are handled in server.js
  }
});

// POST /api/auth/login  ->  start a session
router.post("/login", async function (req, res, next) {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    const passwordOk = user ? await user.comparePassword(password) : false;

    // Same message for "no such user" and "wrong password" on purpose,
    // so attackers cannot find out which emails exist.
    if (!passwordOk) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create a fresh session id on login (prevents session fixation)
    req.session.regenerate(function (err) {
      if (err) return next(err);
      req.session.userId = user._id.toString();
      req.session.save(function (err2) {
        if (err2) return next(err2);
        res.json(publicUser(user));
      });
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout  ->  end the session
router.post("/logout", function (req, res, next) {
  req.session.destroy(function (err) {
    if (err) return next(err);
    res.clearCookie(COOKIE_NAME);
    res.json({ message: "Logged out" });
  });
});

// GET /api/auth/me  ->  who is logged in?
router.get("/me", async function (req, res, next) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not logged in" });
    }
    const user = await User.findById(req.session.userId);
    if (!user) {
      // the account was deleted after login
      return req.session.destroy(function () {
        res.clearCookie(COOKIE_NAME);
        res.status(401).json({ message: "Not logged in" });
      });
    }
    res.json(publicUser(user));
  } catch (error) {
    next(error);
  }
});

module.exports = router;