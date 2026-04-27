const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getRestaurantProfile,
  getRestaurantStats,
} = require("../../controllers/restaurant/dashboardController.js");
const {
  protect,
  restaurantOnly,
} = require("../../middleware/auth.middleware.js");

router.get("/data", protect, restaurantOnly, getDashboardStats);
router.get("/profile", protect, restaurantOnly, getRestaurantProfile);
router.get("/stats", protect, restaurantOnly, getRestaurantStats);

module.exports = router;
