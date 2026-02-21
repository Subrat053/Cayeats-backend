const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    address: { type: String },
    phone: { type: String }, // ✅ added
    email: { type: String }, // ✅ added
    website: { type: String }, // ✅ added
    instagram: { type: String }, // ✅ added
    cuisineTypes: [{ type: String }],
    deliveryProviders: [
      {
        providerName: { type: String },
        orderUrl: { type: String }, // admin-only
        isPreferred: { type: Boolean, default: false },
        clickCount: { type: Number, default: 0 }, // ✅ tracks delivery button clicks
      },
    ],
    openingHours: {
      monday: { open: String, close: String, closed: Boolean },
      tuesday: { open: String, close: String, closed: Boolean },
      wednesday: { open: String, close: String, closed: Boolean },
      thursday: { open: String, close: String, closed: Boolean },
      friday: { open: String, close: String, closed: Boolean },
      saturday: { open: String, close: String, closed: Boolean },
      sunday: { open: String, close: String, closed: Boolean },
    },
    lastUpdatedHours: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    image: { type: String },
    subscription: {
      plan: { type: String, default: "null" },
      startdate: { type: Boolean, default: true }, //for the start date
      expiresAt: { type: Date, default: null },
      autoRenew: { type: Boolean, default: true },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    viewCount: {
      //for analytics tracking
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    }, // ✅ set when featured listing purchased
    profileImage: {
      type: String,
      default: null,
    },
  },

  { timestamps: true },
);

module.exports = mongoose.model("Restaurant", RestaurantSchema);
