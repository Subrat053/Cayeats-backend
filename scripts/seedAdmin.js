require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const ADMIN_EMAIL = "admin@cayeats.com";
const ADMIN_PASSWORD = "Admin@123";

const escapeRegex = (value) =>
  String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const existing = await Admin.findOne({
      email: new RegExp(`^${escapeRegex(ADMIN_EMAIL)}$`, "i"),
    });

    if (existing) {
      existing.fullName = "CayEats Admin";
      existing.email = ADMIN_EMAIL;
      existing.password = hashedPassword;
      existing.role = existing.role || "admin";
      existing.isActive = true;
      await existing.save();
      console.log("✅ Admin updated successfully");
    } else {
      await Admin.create({
        fullName: "CayEats Admin",
        email: ADMIN_EMAIL,
        password: hashedPassword,
      });
      console.log("✅ Admin created successfully");
    }

    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log("   ⚠️  Change password after first login!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

seedAdmin();
