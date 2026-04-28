const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Restaurant = require("../../models/restaurant");
const DeliveryProvider = require("../../models/DeliveryProvider");
const Order = require("../../models/order");

// ─── Register Restaurant ──────────────────────────────────
exports.registerRestaurant = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide fullName, email, and password",
      });
    }

    const existingRestaurant = await Restaurant.findOne({ email });
    if (existingRestaurant) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Get all active delivery providers
    const activeProviders = await DeliveryProvider.find({
      isActive: true,
    }).lean();
    const deliveryProviders = activeProviders.map((p) => ({
      providerName: p.name,
      orderUrl: "",
      isPreferred: false,
      clickCount: 0,
    }));

    // ✅ Initialize default opening hours (9 AM - 9 PM, all days open)
    const defaultHours = {
      monday: { open: "09:00", close: "21:00", closed: false },
      tuesday: { open: "09:00", close: "21:00", closed: false },
      wednesday: { open: "09:00", close: "21:00", closed: false },
      thursday: { open: "09:00", close: "21:00", closed: false },
      friday: { open: "09:00", close: "21:00", closed: false },
      saturday: { open: "09:00", close: "21:00", closed: false },
      sunday: { open: "09:00", close: "21:00", closed: false },
    };

    const newRestaurant = new Restaurant({
      fullName,
      email,
      password: hashedPassword,
      deliveryProviders,
      openingHours: defaultHours,
      subscription: {
        plan: null,
        startDate: null,
        expiresAt: null,
        autoRenew: true,
      },
    });
    await newRestaurant.save();

    const token = jwt.sign(
      { id: newRestaurant._id, role: "restaurant" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      success: true,
      user: {
        id: newRestaurant._id,
        fullName: newRestaurant.fullName,
        email: newRestaurant.email,
        role: "restaurant",
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Login (Restaurant + Admin) ───────────────────────────
exports.loginRestaurant = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }

    const restaurant = await Restaurant.findOne({ email });
    if (!restaurant) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!restaurant.isActive) {
      return res
        .status(403)
        .json({ success: false, message: "This account has been deactivated" });
    }

    if (!restaurant.password) {
      return res.status(400).json({
        success: false,
        message: "Password not set for this restaurant",
      });
    }

    const isMatch = await bcrypt.compare(password, restaurant.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: restaurant._id, role: "restaurant" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      success: true,
      user: {
        id: restaurant._id,
        fullName: restaurant.fullName,
        email: restaurant.email,
        role: "restaurant",
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
