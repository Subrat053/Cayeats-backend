const mongoose = require("mongoose");
require("dotenv").config();

const Restaurant = require("../models/restaurant");
const Product = require("../models/product");
const Category = require("../models/category");

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

const migrateProducts = async () => {
  try {
    await dbConnection();

    console.log("📋 Starting product migration...");

    // Get all restaurants
    const restaurants = await Restaurant.find();
    console.log(`Found ${restaurants.length} restaurants`);

    let migratedCount = 0;
    let restaurantCount = 0;

    for (const restaurant of restaurants) {
      // Find products without a category for this restaurant
      const productsWithoutCategory = await Product.find({
        restaurant: restaurant._id,
        $or: [{ category: null }, { category: { $exists: false } }],
      });

      if (productsWithoutCategory.length === 0) {
        continue;
      }

      restaurantCount++;
      console.log(
        `\n📍 Restaurant: ${restaurant.fullName} (${productsWithoutCategory.length} products to migrate)`,
      );

      // Check if default category exists
      let defaultCategory = await Category.findOne({
        restaurant: restaurant._id,
        name: "Other",
      });

      // Create default category if it doesn't exist
      if (!defaultCategory) {
        defaultCategory = await Category.create({
          name: "Other",
          description: "Miscellaneous items",
          icon: "📦",
          restaurant: restaurant._id,
          displayOrder: 999,
        });
        console.log(`  ✅ Created default category "Other"`);
      }

      // Assign products to default category
      const updateResult = await Product.updateMany(
        {
          restaurant: restaurant._id,
          $or: [{ category: null }, { category: { $exists: false } }],
        },
        { category: defaultCategory._id },
      );

      migratedCount += updateResult.modifiedCount;
      console.log(`  ✅ Migrated ${updateResult.modifiedCount} products`);
    }

    console.log("\n");
    console.log("========================================");
    console.log(`✅ Migration Complete!`);
    console.log(`   Affected restaurants: ${restaurantCount}`);
    console.log(`   Total products migrated: ${migratedCount}`);
    console.log("========================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  }
};

migrateProducts();
