const router = require("express").Router();
const ctrl = require("../../controllers/admin/adminController");
const { protect, adminOnly } = require("../../middleware/auth.middleware");

const {
  getSettings,
  updateSettings,
  uploadBrandingImage,
  brandingUploadMiddleware,
  getFooterSettings,
  updateFooterSettings,
} = require("../../controllers/admin/settingsController");

// ─── Public ───────────────────────────────────────────────
router.post("/login", ctrl.adminLogin);
router.get("/footer", getFooterSettings);

// ─── Protected (admin only) ───────────────────────────────
router.get("/dashboard", protect, adminOnly, ctrl.getDashboardStats);
router.get("/restaurants", protect, adminOnly, ctrl.getAllRestaurants);
router.put(
  "/restaurants/:id/approve",
  protect,
  adminOnly,
  ctrl.approveRestaurant,
);
router.put(
  "/restaurants/:id/reject",
  protect,
  adminOnly,
  ctrl.rejectRestaurant,
);
router.put(
  "/restaurants/:id/subscription",
  protect,
  adminOnly,
  ctrl.updateRestaurantSubscription,
);
router.delete("/restaurants/:id", protect, adminOnly, ctrl.deleteRestaurant);
router.get("/cravings/pending", protect, adminOnly, ctrl.getPendingCravings);
router.put("/cravings/:id/approve", protect, adminOnly, ctrl.approveCraving);
router.put("/cravings/:id/reject", protect, adminOnly, ctrl.rejectCraving);
router.get("/banners/pending", protect, adminOnly, ctrl.getPendingBanners);
router.put("/banners/:id/approve", protect, adminOnly, ctrl.approveBanner);
router.put("/banners/:id/reject", protect, adminOnly, ctrl.rejectBanner);
router.get("/users", protect, adminOnly, ctrl.getAllUsers);
router.get("/analytics", protect, adminOnly, ctrl.getAnalytics);

//---------------delivery providers---------------
router.get(
  "/delivery-providers",
  protect,
  adminOnly,
  ctrl.getDeliveryProviders,
);

//updations of admin on pricing settings
router.get("/settings", protect, adminOnly, getSettings);
router.put("/settings", protect, adminOnly, updateSettings);
router.post(
  "/settings/upload-branding",
  protect,
  adminOnly,
  brandingUploadMiddleware,
  uploadBrandingImage,
);

//updations of admin on footer settings
router.put("/footer", protect, adminOnly, updateFooterSettings);

module.exports = router;
