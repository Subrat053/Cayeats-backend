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
  approvalRequired,
} = require("../../middleware/auth.middleware.js");
const upload = require("../../middleware/upload.js");
const {
  getOrders,
  updateOrderStatus,
  createOrder,
} = require("../../controllers/restaurant/orderController.js");

router.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook,
);
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
  approvalRequired,
  createCheckoutSession,
);
router.post("/register", registerRestaurant);
router.post("/login", loginRestaurant);
router.get("/profile", protect, restaurantOnly, getRestaurantProfile);
router.put(
  "/profile",
  protect,
  restaurantOnly,
  approvalRequired,
  updateRestaurantProfile,
);
router.get("/stats", protect, restaurantOnly, getRestaurantStats);
router.get("/data", protect, restaurantOnly, getDashboardStats);
router.put(
  "/hours",
  protect,
  restaurantOnly,
  approvalRequired,
  updateRestaurantHours,
);
router.get("/subscription", protect, restaurantOnly, getSubscription);
router.put(
  "/subscription/auto-renew",
  protect,
  restaurantOnly,
  approvalRequired,
  toggleAutoRenew,
);
router.get("/billing", protect, restaurantOnly, getBilling);
router.get("/delivery-clicks", protect, restaurantOnly, getDeliveryClicks);
router.post(
  "/upload",
  protect,
  restaurantOnly,
  approvalRequired,
  upload.single("image"),
  uploadImage,
);
router.get("/ads/pricing", protect, restaurantOnly, getAdsPricing);
router.get("/ads/featured", protect, restaurantOnly, getFeaturedListingStatus);
router.post(
  "/ads/featured",
  protect,
  restaurantOnly,
  approvalRequired,
  purchaseFeaturedListing,
);
router.put(
  "/ads/featured/:id/cancel",
  protect,
  restaurantOnly,
  approvalRequired,
  cancelFeaturedListing,
);
router.get("/ads/cravings", protect, restaurantOnly, getCravingsStatus);
router.post(
  "/ads/cravings",
  protect,
  restaurantOnly,
  approvalRequired,
  purchaseTonightsCravings,
);
router.get("/ads/banner", protect, restaurantOnly, getBannerAdStatus);
router.post(
  "/ads/banner",
  protect,
  restaurantOnly,
  approvalRequired,
  purchaseBannerAd,
);
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
  approvalRequired,
  purchasePreferredDelivery,
);
router.get("/products", protect, restaurantOnly, getProducts);
router.post("/products", protect, restaurantOnly, approvalRequired, addProduct);
router.put(
  "/products/:id",
  protect,
  restaurantOnly,
  approvalRequired,
  updateProduct,
);
router.delete(
  "/products/:id",
  protect,
  restaurantOnly,
  approvalRequired,
  deleteProduct,
);

// ─── Orders ───────────────────────────────────────────────
router.get("/orders", protect, restaurantOnly, getOrders);
router.put(
  "/orders/:id/status",
  protect,
  restaurantOnly,
  approvalRequired,
  updateOrderStatus,
);
router.post("/orders", protect, restaurantOnly, approvalRequired, createOrder);

module.exports = router;
