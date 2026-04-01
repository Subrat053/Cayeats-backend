require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const existing = await User.findOne({ email: "admin@cayeats.com" });
    if (existing) {
      console.log("⚠️  Admin already exists — email: admin@cayeats.com");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);
    await User.create({
      fullName: "CayEats Admin",
      email: "admin@cayeats.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log("✅ Admin created successfully");
    console.log("   Email:admin@cayeats.com");
    console.log("   Password: Admin@123");
    console.log("   ⚠️  Change password after first login!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

seedAdmin();
