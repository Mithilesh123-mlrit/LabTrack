// LabTrack - Authentication and role middleware
const User = require("../models/User");

// Blocks the request unless someone is logged in.
// On success it sets req.user so later code knows who is calling.
async function requireLogin(req, res, next) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Please log in first" });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "Please log in first" });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

// Blocks the request unless the logged-in user has one of the allowed roles.
// Always use it AFTER requireLogin.
function requireRole(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to do this" });
    }
    next();
  };
}

module.exports = { requireLogin, requireRole };