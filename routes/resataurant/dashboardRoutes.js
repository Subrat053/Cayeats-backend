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
const { protect } = require("../../middleware/auth.middleware.js");
const upload = require("../../middleware/upload.js");

// ─── Dashboard ────────────────────────────────────────────
router.get("/data", protect, getDashboardStats);
router.get("/profile", protect, getRestaurantProfile);
router.put("/profile", protect, updateRestaurantProfile);
router.get("/stats", protect, getRestaurantStats);

// ─── Hours ────────────────────────────────────────────────
router.put("/hours", protect, updateRestaurantHours);

// ─── Subscription ─────────────────────────────────────────
router.get("/subscription", protect, getSubscription);
router.put("/subscription/auto-renew", protect, toggleAutoRenew);
router.post("/subscription/purchase", protect, purchaseSubscription);

// ─── Billing ──────────────────────────────────────────────
router.get("/billing", protect, getBilling);

// ─── Delivery Clicks ──────────────────────────────────────
router.get("/delivery-clicks", protect, getDeliveryClicks);

// ─── Image Upload ─────────────────────────────────────────
router.post("/upload", protect, upload.single("image"), uploadImage);

module.exports = router;
