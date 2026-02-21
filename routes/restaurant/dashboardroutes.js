const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getRestaurantProfile,
  getRestaurantStats,
} = require("../../controllers/restaurant/dashboardController.js");
const { protect } = require("../../middleware/auth.middleware.js");

router.get("/data", protect, getDashboardStats);
router.get("/profile", protect, getRestaurantProfile);
router.get("/stats", protect, getRestaurantStats);

module.exports = router;
