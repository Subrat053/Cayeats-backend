const express = require("express");
const router = express.Router();
const {
  getAllRestaurants,
  getRestaurantById,
  getCuisineCategories,
  trackDeliveryClick,
} = require("../../controllers/public/browsecontrol");

// all public - no auth needed
router.get("/restaurants", getAllRestaurants);
router.get("/restaurants/:id", getRestaurantById);
router.get("/categories", getCuisineCategories);
router.post("/track-click", trackDeliveryClick); // ✅ delivery button analytics

module.exports = router;
