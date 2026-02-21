const Restaurant = require("../../models/restaurant.js");
const FeaturedListing = require("../../models/featuredlistings.js");
const TonightsCraving = require("../../models/tonightcravings.js");
const BannerAd = require("../../models/bannerad.js");
const PreferredDelivery = require("../../models/preferreddelivery.js");

// ─── Helper: get restaurant for logged in owner ───────────
const getOwnerRestaurant = async (userId) => {
  const restaurant = await Restaurant.findOne({ owner: userId });
  if (!restaurant) throw new Error("Restaurant not found");
  return restaurant;
};

// ─── Helper: calculate end date ───────────────────────────
const calcEndDate = (duration) => {
  const now = new Date();
  const map = {
    "30days": 30,
    "90days": 90,
    "1year": 365,
    daily: 1,
    weekly: 7,
    monthly: 30,
    semiAnnual: 180,
    annual: 365,
    "6months": 180,
  };
  const days = map[duration] || 30;
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
};

// ═══════════════════════════════════════════════════════════
// FEATURED LISTINGS
// ═══════════════════════════════════════════════════════════

exports.getFeaturedListingStatus = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req.user._id);
    const listings = await FeaturedListing.find({
      restaurant: restaurant._id,
      status: { $in: ["active", "pending"] },
    }).sort({ endDate: -1 }); // ✅ newest first

    res.json({ success: true, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.purchaseFeaturedListing = async (req, res) => {
  try {
    const { duration } = req.body;
    if (!["30days", "90days", "1year"].includes(duration)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid duration" });
    }

    const restaurant = await getOwnerRestaurant(req.user._id);

    // ✅ REMOVED the "already exists" check - allow multiple/extend
    const listing = new FeaturedListing({
      restaurant: restaurant._id,
      duration,
      endDate: calcEndDate(duration),
      status: "active",
    });
    await listing.save();

    restaurant.isFeatured = true;
    await restaurant.save();

    res.status(201).json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════
// TONIGHT'S CRAVINGS
// ═══════════════════════════════════════════════════════════

exports.getCravingsStatus = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req.user._id);
    const active = await TonightsCraving.findOne({
      restaurant: restaurant._id,
      status: "active",
      endDate: { $gt: new Date() },
    });
    res.json({ success: true, data: active });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.purchaseTonightsCravings = async (req, res) => {
  try {
    const { image, headline, cta, duration } = req.body;

    if (!image || !headline || !cta || !duration) {
      return res.status(400).json({
        success: false,
        message: "image, headline, cta and duration are required",
      });
    }
    if (!["daily", "weekly"].includes(duration)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid duration" });
    }

    const restaurant = await getOwnerRestaurant(req.user._id);

    const craving = new TonightsCraving({
      restaurant: restaurant._id,
      image,
      headline,
      cta,
      duration,
      endDate: calcEndDate(duration),
      status: "pending", // needs admin approval
    });
    await craving.save();

    res.status(201).json({ success: true, data: craving });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════
// BANNER ADS
// ═══════════════════════════════════════════════════════════

exports.getBannerAdStatus = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req.user._id);
    const ads = await BannerAd.find({
      restaurant: restaurant._id,
      endDate: { $gt: new Date() },
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: ads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.purchaseBannerAd = async (req, res) => {
  try {
    const { zone, image, headline, description, cta, url, duration } = req.body;

    if (!zone || !image || !headline || !cta || !duration) {
      return res.status(400).json({
        success: false,
        message: "zone, image, headline, cta and duration are required",
      });
    }
    if (!["top", "middle", "bottom"].includes(zone)) {
      return res.status(400).json({ success: false, message: "Invalid zone" });
    }

    const restaurant = await getOwnerRestaurant(req.user._id);

    const ad = new BannerAd({
      restaurant: restaurant._id,
      zone,
      image,
      headline,
      description,
      cta,
      url,
      duration,
      endDate: calcEndDate(duration),
      status: "pending", // ✅ admin must approve per spec
    });
    await ad.save();

    res.status(201).json({ success: true, data: ad });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════
// PREFERRED DELIVERY
// ═══════════════════════════════════════════════════════════

exports.getPreferredDeliveryStatus = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req.user._id);
    const active = await PreferredDelivery.findOne({
      restaurant: restaurant._id,
      status: "active",
      endDate: { $gt: new Date() },
    });
    res.json({ success: true, data: active });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.purchasePreferredDelivery = async (req, res) => {
  try {
    const { providerName, duration } = req.body;

    if (!providerName || !duration) {
      return res.status(400).json({
        success: false,
        message: "providerName and duration are required",
      });
    }
    if (!["6months", "1year"].includes(duration)) {
      return res
        .status(400)
        .json({ success: false, message: "Duration must be 6months or 1year" });
    }

    const restaurant = await getOwnerRestaurant(req.user._id);

    // ✅ validate provider exists on this restaurant
    const providerExists = restaurant.deliveryProviders.find(
      (p) => p.providerName === providerName,
    );
    if (!providerExists) {
      return res.status(400).json({
        success: false,
        message: "Provider not found on this restaurant",
      });
    }

    // ✅ only ONE preferred provider per restaurant - clear existing
    await PreferredDelivery.updateMany(
      { restaurant: restaurant._id, status: "active" },
      { status: "expired" },
    );

    // ✅ clear all preferred flags then set new one
    restaurant.deliveryProviders.forEach((p) => {
      p.isPreferred = false;
    });
    const provider = restaurant.deliveryProviders.find(
      (p) => p.providerName === providerName,
    );
    provider.isPreferred = true;
    await restaurant.save();

    const preferred = new PreferredDelivery({
      restaurant: restaurant._id,
      providerName,
      duration,
      endDate: calcEndDate(duration),
      status: "active",
    });
    await preferred.save();

    res.status(201).json({ success: true, data: preferred });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Pricing (admin-controlled, read from env or settings) ─
exports.getAdsPricing = async (req, res) => {
  try {
    // ✅ in future this will pull from AdminSettings model
    // for now use env vars with fallback defaults
    res.json({
      success: true,
      data: {
        featuredListing: {
          "30days": parseInt(process.env.FEATURED_30DAYS) || 150,
          "90days": parseInt(process.env.FEATURED_90DAYS) || 350,
          "1year": parseInt(process.env.FEATURED_1YEAR) || 1000,
        },
        tonightsCravings: {
          daily: parseInt(process.env.CRAVINGS_DAILY) || 25,
          weekly: parseInt(process.env.CRAVINGS_WEEKLY) || 140,
        },
        bannerAds: {
          top: { monthly: parseInt(process.env.BANNER_TOP) || 800 },
          middle: { monthly: parseInt(process.env.BANNER_MIDDLE) || 500 },
          bottom: { monthly: parseInt(process.env.BANNER_BOTTOM) || 300 },
        },
        preferredDelivery: {
          "6months": parseInt(process.env.PREFERRED_6MO) || 400,
          "1year": parseInt(process.env.PREFERRED_1YR) || 700,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelFeaturedListing = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req.user._id);

    const listing = await FeaturedListing.findOneAndUpdate(
      { restaurant: restaurant._id, status: "active" },
      { status: "inactive" },
      { new: true },
    );

    if (!listing) {
      return res
        .status(404)
        .json({ success: false, message: "No active listing found" });
    }

    // ✅ remove featured flag from restaurant
    restaurant.isFeatured = false;
    await restaurant.save();

    res.json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
