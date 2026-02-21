const express = require("express");
const router = express.Router();

// Import all admin routes
const reastaurantProfileRoutes = require("./reastaurantRouter");

// Mount routes
router.use("/", reastaurantProfileRoutes);

module.exports = router;
