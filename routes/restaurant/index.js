const express = require("express");
const router = express.Router();

// Import restaurant routes
const restaurantProfileRoutes = require("./restaurantRouter");

// Mount routes
router.use("/", restaurantProfileRoutes);

module.exports = router;
