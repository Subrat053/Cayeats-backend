const express = require("express");
const router = express.Router();

const {
  registerRestaurant,
  loginRestaurant,
} = require("../../controllers/restaurant/restaurantController");

const {
  getDashboardStats,
  getRestaurantProfile,
  getRestaurantStats,
  updateRestaurantProfile,
  updateRestaurantHours,
  getSubscription,
  toggleAutoRenew,
  getBilling,
  getDeliveryClicks,
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
  createCheckoutSession,
  handleWebhook,
  getSubscriptionPricing,
} = require("../../controllers/restaurant/stripeController.js");

const {
  protect,
  restaurantOnly,
} = require("../../middleware/auth.middleware.js");
const upload = require("../../middleware/upload.js");

// ─── Stripe Webhook (raw body — MUST be first) ────────────
router.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook,
);

// ─── Stripe routes BEFORE /subscription ───────────────────
router.get(
  "/subscription/pricing",
  protect,
  restaurantOnly,
  getSubscriptionPricing,
);
router.post(
  "/subscription/checkout",
  protect,
  restaurantOnly,
  createCheckoutSession,
);

// ─── Public ───────────────────────────────────────────────
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

// ─── Ads ──────────────────────────────────────────────────
router.get("/ads/pricing", protect, restaurantOnly, getAdsPricing);
router.get("/ads/featured", protect, restaurantOnly, getFeaturedListingStatus);
router.post("/ads/featured", protect, restaurantOnly, purchaseFeaturedListing);
router.put(
  "/ads/featured/:id/cancel",
  protect,
  restaurantOnly,
  cancelFeaturedListing,
);
router.get("/ads/cravings", protect, restaurantOnly, getCravingsStatus);
router.post("/ads/cravings", protect, restaurantOnly, purchaseTonightsCravings);
router.get("/ads/banner", protect, restaurantOnly, getBannerAdStatus);
router.post("/ads/banner", protect, restaurantOnly, purchaseBannerAd);
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
