const Restaurant = require("../../models/restaurant.js");

// ─── Get All Restaurants (public) ────────────────────────
exports.getAllRestaurants = async (req, res) => {
  try {
    const { cuisine, search, open, provider } = req.query;

    const query = { isApproved: true }; // ✅ only show admin-approved restaurants

    if (cuisine) {
      query.cuisineTypes = { $in: [new RegExp(`^${cuisine}$`, "i")] };
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { cuisineTypes: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (provider) {
      query["deliveryProviders.providerName"] = {
        $regex: provider,
        $options: "i",
      };
    }

    let restaurants = await Restaurant.find(query)
      .select("-owner") // ✅ never expose owner ID publicly
      .sort({ fullName: 1 }); // A-Z

    // ✅ filter by open now if requested
    if (open === "true") {
      const now = new Date();
      const day = now
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();
      const time = now.toTimeString().slice(0, 5); // "HH:MM"

      restaurants = restaurants.filter((r) => {
        const hours = r.openingHours?.[day];
        if (!hours || hours.closed) return false;
        return time >= hours.open && time <= hours.close;
      });
    }

    res.json({ success: true, data: restaurants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Single Restaurant (public) ──────────────────────
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      _id: req.params.id,
      isApproved: true,
    }).select("-owner");

    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    // ✅ increment view count (analytics)
    await Restaurant.findByIdAndUpdate(req.params.id, {
      $inc: { viewCount: 1 },
    });

    res.json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Cuisine Categories (public) ─────────────────────
exports.getCuisineCategories = async (req, res) => {
  try {
    const cuisines = await Restaurant.aggregate([
      { $match: { isApproved: true } },
      { $unwind: "$cuisineTypes" },
      { $group: { _id: "$cuisineTypes", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: cuisines.map((c) => ({ name: c._id, count: c.count })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Track Delivery Button Click (public) ────────────────
exports.trackDeliveryClick = async (req, res) => {
  try {
    const { restaurantId, providerName } = req.body;

    await Restaurant.updateOne(
      {
        _id: restaurantId,
        "deliveryProviders.providerName": providerName,
      },
      {
        $inc: { "deliveryProviders.$.clickCount": 1 }, // ✅ increments correct provider
      },
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Restaurant Menu (products by categories - public) ─
exports.getRestaurantMenu = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { searchTerm = "" } = req.query;

    const Category = require("../../models/category");
    const Product = require("../../models/product");

    // Verify restaurant exists and is approved
    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      isApproved: true,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Get all categories for the restaurant
    const categories = await Category.find({
      restaurant: restaurantId,
      isActive: true,
    }).sort({ displayOrder: 1, createdAt: 1 });

    // Get all products for the restaurant
    let productsQuery = {
      restaurant: restaurantId,
      isAvailable: true,
    };

    if (searchTerm) {
      productsQuery.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
      ];
    }

    const products = await Product.find(productsQuery)
      .populate("category", "name icon description displayOrder")
      .exec();

    // Organize products by category
    const menuByCategory = categories.map((category) => ({
      _id: category._id,
      name: category.name,
      description: category.description,
      icon: category.icon,
      displayOrder: category.displayOrder,
      products: products.filter(
        (p) => p.category?._id?.toString() === category._id.toString(),
      ),
    }));

    res.json({
      success: true,
      data: {
        restaurant: {
          _id: restaurant._id,
          fullName: restaurant.fullName,
          image: restaurant.image,
          rating: restaurant.rating,
          reviewCount: restaurant.reviewCount,
          address: restaurant.address,
        },
        categories: menuByCategory.filter((cat) => cat.products.length > 0),
      },
    });
  } catch (error) {
    console.error("Error fetching restaurant menu:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Track Category View (public) ──────────────────────────
exports.trackCategoryView = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const Category = require("../../models/category");

    const category = await Category.findByIdAndUpdate(
      categoryId,
      {
        $inc: { viewCount: 1 },
        lastViewedAt: new Date(),
      },
      { new: true },
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: {
        viewCount: category.viewCount,
      },
    });
  } catch (error) {
    console.error("Error tracking category view:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Get Public Settings (no auth needed) ───────────────
exports.getPublicSettings = async (req, res) => {
  try {
    const Settings = require("../../models/settings");
    const settings = await Settings.findOne();

    if (!settings) {
      return res.json({
        success: true,
        data: {
          currency: "USD",
        },
      });
    }

    res.json({
      success: true,
      data: {
        currency: settings?.payments?.currency || "USD",
      },
    });
  } catch (error) {
    console.error("Error fetching public settings:", error);
    res.json({
      success: true,
      data: {
        currency: "USD",
      },
    });
  }
};
