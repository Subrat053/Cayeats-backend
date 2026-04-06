// auth.middleware.js
//cayeats

const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  if (req.isMasterAdmin) return next();
  if (
    req.headers["x-master-admin-secret"] === process.env.MASTER_ADMIN_SECRET
  ) {
    req.isMasterAdmin = true;
    req.user = { id: "master-admin", role: "admin", isActive: true };
    return next();
  }

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token missing" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === "admin" && decoded.id === "admin") {
      req.user = decoded;
      return next();
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError")
      return res.status(401).json({ message: "Token expired" });
    if (error.name === "JsonWebTokenError")
      return res.status(401).json({ message: "Invalid token" });
    res.status(401).json({ message: "Unauthorized" });
  }
};

// ✅ NEW - use this on restaurant-only routes
exports.restaurantOnly = (req, res, next) => {
  if (req.isMasterAdmin) return next();
  if (
    req.headers["x-master-admin-secret"] === process.env.MASTER_ADMIN_SECRET
  ) {
    req.isMasterAdmin = true;
    req.user = { id: "master-admin", role: "admin", isActive: true };
    return next();
  }
  if (req.user?.role !== "restaurant") {
    return res
      .status(403)
      .json({ message: "Access denied. Restaurants only." });
  }
  next();
};

// ✅ NEW - use this on admin-only routes
exports.adminOnly = (req, res, next) => {
  if (req.isMasterAdmin) return next();
  if (
    req.headers["x-master-admin-secret"] === process.env.MASTER_ADMIN_SECRET
  ) {
    req.isMasterAdmin = true;
    req.user = { id: "master-admin", role: "admin", isActive: true };
    return next();
  }
  if (req.user?.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Admin access required" });
  }
  next();
};
