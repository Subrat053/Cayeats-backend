const User = require("../../models/User");
const Admin = require("../../models/Admin");
const Restaurant = require("../../models/restaurant");
const Transaction = require("../../models/transaction");
const TonightsCraving = require("../../models/tonightcravings");
const BannerAd = require("../../models/bannerad");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const normalizeEmail = (email) => String(email || "").trim();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ─── Admin Login ──────────────────────────────────────────
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = normalizeEmail(email);
    const admin = await Admin.findOne({
      email: new RegExp(`^${escapeRegex(normalizedEmail)}$`, "i"),
    });
    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    if (!admin.isActive) {
      return res
        .status(403)
        .json({ success: false, message: "This account has been deactivated" });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.json({
      success: true,
      user: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: "admin",
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Dashboard Stats ──────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalRestaurants,
      pendingRestaurants,
      totalUsers,
      activeSubscriptions,
      pendingCravings,
      pendingBanners,
      transactions,
      allRestaurants,
    ] = await Promise.all([
      Restaurant.countDocuments(),
      Restaurant.countDocuments({ isApproved: false }),
      User.countDocuments({ role: "customer" }),
      Restaurant.countDocuments({
        "subscription.expiresAt": { $gt: new Date() },
        "subscription.plan": { $ne: null },
      }),
      TonightsCraving.countDocuments({ status: "pending" }),
      BannerAd.countDocuments({ status: "pending" }),
      Transaction.find({ status: "completed" }),
      Restaurant.find({}, "viewCount deliveryProviders"),
    ]);

    // total revenue
    const totalRevenue = transactions.reduce(
      (sum, t) => sum + (t.amount || 0),
      0,
    );

    // total delivery clicks
    const totalClicks = allRestaurants.reduce((sum, r) => {
      return (
        sum +
        (r.deliveryProviders?.reduce((s, p) => s + (p.clickCount || 0), 0) || 0)
      );
    }, 0);

    // total views
    const totalViews = allRestaurants.reduce(
      (sum, r) => sum + (r.viewCount || 0),
      0,
    );

    res.json({
      success: true,
      data: {
        totalRestaurants,
        pendingRestaurants,
        totalUsers,
        activeSubscriptions,
        totalRevenue,
        totalClicks,
        totalViews,
        pendingApprovals: {
          restaurants: pendingRestaurants,
          cravings: pendingCravings,
          banners: pendingBanners,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Restaurants ──────────────────────────────────────────
exports.getAllRestaurants = async (req, res) => {
  try {
    const { search, approved, verified, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) query.fullName = { $regex: search, $options: "i" };
    if (approved !== undefined) query.isApproved = approved === "true";
    if (verified !== undefined) query.isVerified = verified === "true";

    const restaurants = await Restaurant.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Restaurant.countDocuments(query);

    res.json({ success: true, data: restaurants, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true },
    );
    if (!restaurant)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { isApproved: false, isVerified: false },
      { new: true },
    );
    if (!restaurant)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateRestaurantSubscription = async (req, res) => {
  try {
    const { plan, expiresAt } = req.body;
    const durationMap = { Silver: 180, Gold: 365, Platinum: 730 };
    const startDate = new Date();
    const endDate = expiresAt
      ? new Date(expiresAt)
      : new Date(
          startDate.getTime() +
            (durationMap[plan] || 365) * 24 * 60 * 60 * 1000,
        );

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      {
        "subscription.plan": plan,
        "subscription.startDate": startDate,
        "subscription.expiresAt": endDate,
        isVerified: true,
      },
      { new: true },
    );
    if (!restaurant)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);

    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    res.json({
      success: true,
      message: "Restaurant deleted successfully",
      data: restaurant,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Tonight's Cravings ───────────────────────────────────
exports.getPendingCravings = async (req, res) => {
  try {
    const cravings = await TonightsCraving.find({ status: "pending" })
      .populate("restaurant", "fullName")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: cravings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveCraving = async (req, res) => {
  try {
    const craving = await TonightsCraving.findByIdAndUpdate(
      req.params.id,
      { status: "active" },
      { new: true },
    );
    if (!craving)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: craving });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectCraving = async (req, res) => {
  try {
    const craving = await TonightsCraving.findByIdAndUpdate(
      req.params.id,
      { status: "expired" },
      { new: true },
    );
    if (!craving)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: craving });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Banner Ads ───────────────────────────────────────────
exports.getPendingBanners = async (req, res) => {
  try {
    const banners = await BannerAd.find({ status: "pending" })
      .populate("restaurant", "fullName")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveBanner = async (req, res) => {
  try {
    const banner = await BannerAd.findByIdAndUpdate(
      req.params.id,
      { status: "active" },
      { new: true },
    );
    if (!banner)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectBanner = async (req, res) => {
  try {
    const { reason } = req.body;
    const banner = await BannerAd.findByIdAndUpdate(
      req.params.id,
      { status: "rejected", rejectionReason: reason },
      { new: true },
    );
    if (!banner)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Users ────────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "customer" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete User ──────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Delete associated restaurant if exists
    if (user.role === "restaurant") {
      await Restaurant.deleteOne({ owner: user._id });
    }

    // Delete the user
    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Deactivate User ──────────────────────────────────────
exports.deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Also deactivate associated restaurant if exists
    if (user.role === "restaurant") {
      await Restaurant.updateOne({ owner: user._id }, { isActive: false });
    }

    res.json({
      success: true,
      message: "User deactivated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Activate User ────────────────────────────────────────
exports.activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true },
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Also activate associated restaurant if exists
    if (user.role === "restaurant") {
      await Restaurant.updateOne({ owner: user._id }, { isActive: true });
    }

    res.json({
      success: true,
      message: "User activated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Platform Analytics ───────────────────────────────────
exports.getAnalytics = async (req, res) => {
  try {
    const restaurants = await Restaurant.find(
      {},
      "fullName viewCount deliveryProviders isFeatured isVerified",
    );

    const topByViews = [...restaurants]
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 5)
      .map((r) => ({ name: r.fullName, views: r.viewCount || 0 }));

    const topByClicks = [...restaurants]
      .map((r) => ({
        name: r.fullName,
        clicks:
          r.deliveryProviders?.reduce((s, p) => s + (p.clickCount || 0), 0) ||
          0,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);

    const providerTotals = {};
    restaurants.forEach((r) => {
      r.deliveryProviders?.forEach((p) => {
        providerTotals[p.providerName] =
          (providerTotals[p.providerName] || 0) + (p.clickCount || 0);
      });
    });

    res.json({
      success: true,
      data: { topByViews, topByClicks, providerTotals },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delivery Providers ───────────────────────────────────
exports.getDeliveryProviders = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({}, "deliveryProviders fullName");

    // aggregate all unique providers across all restaurants
    const providerMap = {};
    restaurants.forEach((r) => {
      r.deliveryProviders?.forEach((p) => {
        if (!providerMap[p.providerName]) {
          providerMap[p.providerName] = {
            name: p.providerName,
            totalClicks: 0,
            restaurants: 0,
          };
        }
        providerMap[p.providerName].totalClicks += p.clickCount || 0;
        providerMap[p.providerName].restaurants += 1;
      });
    });

    res.json({ success: true, data: Object.values(providerMap) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
