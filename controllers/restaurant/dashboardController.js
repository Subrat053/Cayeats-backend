const cloudinary = require("cloudinary").v2;
const Restaurant = require("../../models/restaurant.js");
const Transaction = require("../../models/transaction.js");

exports.getDashboardStats = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user._id).select(
      "-password",
    );
    if (!restaurant)
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    res.json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRestaurantProfile = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user._id).select(
      "-password",
    );
    if (!restaurant)
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    res.json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateRestaurantProfile = async (req, res) => {
  try {
    const allowed = [
      "fullName",
      "description",
      "cuisineTypes",
      "address",
      "phone",
      "email",
      "website",
      "instagram",
      "deliveryProviders",
      "profileImage",
    ];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-password");

    if (!restaurant)
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    res.json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRestaurantStats = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user._id);
    if (!restaurant)
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });

    const totalClicks =
      restaurant.deliveryProviders?.reduce(
        (sum, p) => sum + (p.clickCount || 0),
        0,
      ) || 0;

    res.json({
      success: true,
      data: {
        viewCount: restaurant.viewCount || 0,
        totalClicks,
        isVerified: restaurant.isVerified,
        isApproved: restaurant.isApproved,
        isFeatured: restaurant.isFeatured,
        deliveryProviders: restaurant.deliveryProviders || [],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateRestaurantHours = async (req, res) => {
  try {
    const { hours } = req.body;
    if (!hours)
      return res
        .status(400)
        .json({ success: false, message: "Hours are required" });

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.user._id,
      { $set: { openingHours: hours, lastHoursUpdate: new Date() } },
      { new: true },
    );

    if (!restaurant)
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    res.json({ success: true, data: restaurant.openingHours });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSubscription = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user._id);
    if (!restaurant)
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });

    const sub = restaurant.subscription || {};
    const now = Date.now();
    const expiresAt = sub.expiresAt ? new Date(sub.expiresAt).getTime() : null;
    const daysLeft = expiresAt
      ? Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24))
      : null;
    const status = !expiresAt ? "none" : daysLeft > 0 ? "active" : "expired";

    if (status === "active" && !restaurant.isVerified) {
      restaurant.isVerified = true;
      await restaurant.save();
    } else if (status === "expired" && restaurant.isVerified) {
      restaurant.isVerified = false;
      await restaurant.save();
    }

    res.json({
      success: true,
      data: {
        isVerified: restaurant.isVerified,
        isApproved: restaurant.isApproved,
        plan: sub.plan || null,
        startdate: sub.startdate || null,
        expiresAt: sub.expiresAt || null,
        autoRenew: sub.autoRenew ?? true,
        daysLeft,
        status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleAutoRenew = async (req, res) => {
  try {
    const { autoRenew } = req.body;
    const restaurant = await Restaurant.findById(req.user._id);
    if (!restaurant)
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });

    restaurant.subscription.autoRenew = autoRenew;
    await restaurant.save();

    res.json({
      success: true,
      data: { autoRenew: restaurant.subscription.autoRenew },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBilling = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user._id);
    if (!restaurant)
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });

    const transactions = await Transaction.find({
      restaurant: restaurant._id,
    }).sort({ createdAt: -1 });

    const totalSpent = transactions
      .filter((t) => t.status === "completed")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const pendingAmount = transactions
      .filter((t) => t.status === "pending")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const activeServices = transactions.filter(
      (t) =>
        t.status === "completed" &&
        t.autoRenew &&
        t.renewDate &&
        new Date(t.renewDate) > new Date(),
    ).length;

    res.json({
      success: true,
      data: { transactions, totalSpent, pendingAmount, activeServices },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.purchaseSubscription = async (req, res) => {
  try {
    const { plan } = req.body; // 'Silver', 'Gold', 'Platinum'

    const durationMap = {
      Silver: 180, // 6 months
      Gold: 365, // 1 year
      Platinum: 730, // 2 years
    };

    if (!durationMap[plan]) {
      return res.status(400).json({ success: false, message: "Invalid plan" });
    }

    const restaurant = await Restaurant.findById(req.user._id);
    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    const startDate = new Date();
    const expiresAt = new Date(
      startDate.getTime() + durationMap[plan] * 24 * 60 * 60 * 1000,
    );

    restaurant.subscription = { plan, startDate, expiresAt, autoRenew: true };
    restaurant.isVerified = true;
    await restaurant.save();

    // ✅ create transaction record
    await Transaction.create({
      restaurant: restaurant._id,
      type: "restaurant_claim",
      description: `${plan} Plan — ${durationMap[plan] / 30} Month Subscription`,
      amount: { Silver: 160, Gold: 240, Platinum: 400 }[plan],
      status: "completed",
      autoRenew: true,
      renewDate: expiresAt,
    });

    res.json({
      success: true,
      data: { plan, startDate, expiresAt },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDeliveryClicks = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user._id);
    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    const providers = restaurant.deliveryProviders || [];
    const totalClicks = providers.reduce(
      (sum, p) => sum + (p.clickCount || 0),
      0,
    );

    res.json({
      success: true,
      data: {
        providers: providers.map((p) => ({
          providerName: p.providerName,
          clickCount: p.clickCount || 0,
          orderUrl: p.orderUrl,
          isPreferred: p.isPreferred,
          percentage:
            totalClicks > 0
              ? Math.round(((p.clickCount || 0) / totalClicks) * 100)
              : 0,
        })),
        totalClicks,
        viewCount: restaurant.viewCount || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Delivery Provider URL ──────────────────────────
exports.updateRestaurantDeliveryProviders = async (req, res) => {
  try {
    const { providerName, orderUrl } = req.body;

    if (!providerName || !orderUrl) {
      return res.status(400).json({
        success: false,
        message: "Provider name and order URL are required",
      });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          "deliveryProviders.$[elem].orderUrl": orderUrl,
        },
      },
      {
        arrayFilters: [{ "elem.providerName": providerName }],
        new: true,
      },
    );

    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    res.json({
      success: true,
      message: `${providerName} link updated successfully`,
      data: restaurant.deliveryProviders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Add Menu Image ────────────────────────────────────────
exports.addMenuImage = async (req, res) => {
  try {
    const { imageUrl, publicId } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Image URL is required",
      });
    }

    // Store both URL and publicId for future deletion
    const menuImageObj = {
      url: imageUrl,
      publicId: publicId || "", // publicId may not always be provided
    };

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.user._id,
      { $push: { menuImages: menuImageObj } },
      { new: true },
    ).select("-password");

    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    res.json({
      success: true,
      message: "Menu image added successfully",
      data: restaurant.menuImages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete Menu Image ─────────────────────────────────────
exports.deleteMenuImage = async (req, res) => {
  try {
    const { imageUrl, publicId } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Image URL is required",
      });
    }

    // Try to delete from Cloudinary if publicId is provided
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Cloudinary deletion error:", error);
        // Continue anyway - we'll still remove from database
      }
    }

    // Remove from database
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.user._id,
      { $pull: { menuImages: { url: imageUrl } } },
      { new: true },
    ).select("-password");

    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    res.json({
      success: true,
      message: "Menu image deleted successfully",
      data: restaurant.menuImages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Menu Images ───────────────────────────────────────
exports.getMenuImages = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user._id).select(
      "menuImages",
    );

    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    res.json({
      success: true,
      data: restaurant.menuImages || [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
