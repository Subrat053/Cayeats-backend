const Restaurant = require("../../models/restaurant.js");

// ─── Get All Restaurants (public) ────────────────────────
exports.getAllRestaurants = async (req, res) => {
  try {
    const { cuisine, search, open, provider } = req.query;

    const query = { isApproved: true }; // ✅ only show admin-approved restaurants

    if (cuisine) {
      query.cuisineTypes = { $in: [cuisine] };
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
