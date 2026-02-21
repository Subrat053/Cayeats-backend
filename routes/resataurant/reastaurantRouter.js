const express = require("express");
const router = express.Router();

const {
  registerRestaurant,
  loginRestaurant,
} = require("../../controllers/restaurant/restaurantController");

const {
  protect,
  restaurantOnly,
} = require("../../middleware/auth.middleware.js");

const upload = require("../../middleware/upload.js");

const {
  getDashboardStats,
  getRestaurantProfile,
  getRestaurantStats,
  updateRestaurantProfile,
  updateRestaurantHours,
  getSubscription,
  toggleAutoRenew,
  getBilling,
} = require("../../controllers/restaurant/dashboardController.js");

const {
  getFeaturedListingStatus,
  purchaseFeaturedListing,
  cancelFeaturedListing,
  getCravingsStatus,
  purchaseTonightsCravings,
  getBannerAdStatus,
  purchaseBannerAd,
  getPreferredDeliveryStatus,
  purchasePreferredDelivery,
  getAdsPricing,
} = require("../../controllers/restaurant/adscontroller.js");

const {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} = require("../../controllers/restaurant/productController.js");

const {
  uploadImage,
} = require("../../controllers/restaurant/uploadcontroller.js");

const {
  // ...existing imports
  getDeliveryClicks, // ✅ add this
} = require("../../controllers/restaurant/dashboardController.js");

router.get("/delivery-clicks", protect, restaurantOnly, getDeliveryClicks);

// ─── Public Routes ────────────────────────────────────────
router.post("/register", registerRestaurant);
router.post("/login", loginRestaurant);

// ─── Profile & Stats ──────────────────────────────────────
router.get("/profile", protect, restaurantOnly, getRestaurantProfile);
router.put("/profile", protect, restaurantOnly, updateRestaurantProfile);
router.get("/stats", protect, restaurantOnly, getRestaurantStats);
router.get("/data", protect, restaurantOnly, getDashboardStats);
router.put("/hours", protect, restaurantOnly, updateRestaurantHours);

// ─── Subscription & Billing ───────────────────────────────
router.get("/subscription", protect, restaurantOnly, getSubscription);
router.put(
  "/subscription/auto-renew",
  protect,
  restaurantOnly,
  toggleAutoRenew,
);
router.get("/billing", protect, restaurantOnly, getBilling);

// ─── Image Upload ─────────────────────────────────────────
router.post(
  "/upload",
  protect,
  restaurantOnly,
  upload.single("image"),
  uploadImage,
);

// ─── Ads Pricing ──────────────────────────────────────────
router.get("/ads/pricing", protect, restaurantOnly, getAdsPricing);

// ─── Featured Listing ─────────────────────────────────────
router.get("/ads/featured", protect, restaurantOnly, getFeaturedListingStatus);
router.post("/ads/featured", protect, restaurantOnly, purchaseFeaturedListing);
router.put(
  "/ads/featured/:id/cancel",
  protect,
  restaurantOnly,
  cancelFeaturedListing,
);

// ─── Tonight's Cravings ───────────────────────────────────
router.get("/ads/cravings", protect, restaurantOnly, getCravingsStatus);
router.post("/ads/cravings", protect, restaurantOnly, purchaseTonightsCravings);

// ─── Banner Ads ───────────────────────────────────────────
router.get("/ads/banner", protect, restaurantOnly, getBannerAdStatus);
router.post("/ads/banner", protect, restaurantOnly, purchaseBannerAd);

// ─── Preferred Delivery ───────────────────────────────────
router.get(
  "/ads/preferred-delivery",
  protect,
  restaurantOnly,
  getPreferredDeliveryStatus,
);
router.post(
  "/ads/preferred-delivery",
  protect,
  restaurantOnly,
  purchasePreferredDelivery,
);

// ─── Products ─────────────────────────────────────────────
router.get("/products", protect, restaurantOnly, getProducts);
router.post("/products", protect, restaurantOnly, addProduct);
router.put("/products/:id", protect, restaurantOnly, updateProduct);
router.delete("/products/:id", protect, restaurantOnly, deleteProduct);

module.exports = router;
