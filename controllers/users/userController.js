const User = require("../../models/User");
const Admin = require("../../models/Admin");
const Restaurant = require("../../models/restaurant");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendPasswordResetEmail } = require("../../utils/mailer");

const RESET_MODELS = [
  { model: User, role: "customer" },
  { model: Restaurant, role: "restaurant" },
  { model: Admin, role: "admin" },
];

const normalizeEmail = (email) => String(email || "").trim();

const findResetTarget = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  for (const entry of RESET_MODELS) {
    const document = await entry.model.findOne({
      email: new RegExp(
        `^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        "i",
      ),
    });
    if (document) {
      return { document, role: entry.role };
    }
  }
  return { document: null, role: null };
};

// ─── Register Customer ────────────────────────────────────
exports.registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: "customer",
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Login Customer ───────────────────────────────────────
exports.loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }

    const user = await User.findOne({ email, role: "customer" });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Profile ──────────────────────────────────────────
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Request Password Reset ──────────────────────────────
exports.requestPasswordReset = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const { document, role } = await findResetTarget(email);
    if (!document) {
      return res
        .status(200)
        .json({
          success: true,
          message: "If the email exists, a code was sent",
        });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    document.resetCode = code;
    document.resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
    await document.save();

    try {
      await sendPasswordResetEmail({
        email: document.email,
        fullName: document.fullName,
        code,
      });

      return res.status(200).json({
        success: true,
        message: "Reset code sent to email",
        accountType: role,
      });
    } catch (mailError) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Password reset email not sent:", mailError.message);
        return res.status(200).json({
          success: true,
          message: "Email service not configured. Use code from response.",
          code,
          accountType: role,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Email service not configured. Contact support.",
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Reset Password ──────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { code, newPassword, confirmPassword, accountType } = req.body;

    if (!email || !code || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 6 characters",
        });
    }

    const targetModel = RESET_MODELS.find(
      (entry) => entry.role === accountType,
    )?.model;
    const { document } = targetModel
      ? {
          document: await targetModel.findOne({
            email: new RegExp(
              `^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
              "i",
            ),
          }),
        }
      : await findResetTarget(email);
    if (!document || !document.resetCode || !document.resetCodeExpires) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset code" });
    }

    if (document.resetCode !== code || document.resetCodeExpires < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset code" });
    }

    document.password = await bcrypt.hash(newPassword, 10);
    document.resetCode = null;
    document.resetCodeExpires = null;
    await document.save();

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
