const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getRestaurantProfile,
  updateRestaurantProfile,
  getRestaurantStats,
  updateRestaurantHours,
  getSubscription,
  toggleAutoRenew,
  getBilling,
  purchaseSubscription,
  getDeliveryClicks,
} = require("../../controllers/restaurant/dashboardController.js");
const {
  uploadImage,
} = require("../../controllers/restaurant/uploadController.js");
const {
  protect,
  restaurantOnly,
} = require("../../middleware/auth.middleware.js");
const upload = require("../../middleware/upload.js");

// ─── Dashboard ────────────────────────────────────────────
router.get("/data", protect, restaurantOnly, getDashboardStats);
router.get("/profile", protect, restaurantOnly, getRestaurantProfile);
router.put("/profile", protect, restaurantOnly, updateRestaurantProfile);
router.get("/stats", protect, restaurantOnly, getRestaurantStats);

// ─── Hours ────────────────────────────────────────────────
router.put("/hours", protect, restaurantOnly, updateRestaurantHours);

// ─── Subscription ─────────────────────────────────────────
router.get("/subscription", protect, restaurantOnly, getSubscription);
router.put(
  "/subscription/auto-renew",
  protect,
  restaurantOnly,
  toggleAutoRenew,
);
router.post(
  "/subscription/purchase",
  protect,
  restaurantOnly,
  purchaseSubscription,
);

// ─── Billing ──────────────────────────────────────────────
router.get("/billing", protect, restaurantOnly, getBilling);

// ─── Delivery Clicks ──────────────────────────────────────
router.get("/delivery-clicks", protect, restaurantOnly, getDeliveryClicks);

// ─── Image Upload ─────────────────────────────────────────
router.post(
  "/upload",
  protect,
  restaurantOnly,
  upload.single("image"),
  uploadImage,
);

module.exports = router;
