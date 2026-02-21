const User       = require("../../models/User");
const bcrypt     = require("bcryptjs");
const jwt        = require("jsonwebtoken");
const Restaurant = require("../../models/restaurant");

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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role: "restaurant",
    });
    await newUser.save();

    const newRestaurant = new Restaurant({
      fullName,
      owner: newUser._id,
      subscription: {
        plan:      null,
        startDate: null,
        expiresAt: null,
        autoRenew: true,
      },
    });
    await newRestaurant.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      user: { id: newUser._id, fullName: newUser.fullName, email: newUser.email, role: newUser.role },
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
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    // ✅ find any role — admin and restaurant both use this login
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // ✅ block customers from dashboard login
    if (user.role === "customer") {
      return res.status(403).json({ success: false, message: "Use the customer login instead" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};