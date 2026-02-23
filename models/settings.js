const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    claimPricing: {
      semiAnnual: { type: Number, default: 160 },
      annual: { type: Number, default: 240 },
    },
    firstYearDiscount: { type: Number, default: 50 }, // % off first year
    productPlans: {
      basic: {
        semiAnnual: { type: Number, default: 99 },
        annual: { type: Number, default: 179 },
      },
      professional: {
        semiAnnual: { type: Number, default: 199 },
        annual: { type: Number, default: 349 },
      },
      enterprise: {
        semiAnnual: { type: Number, default: 399 },
        annual: { type: Number, default: 699 },
      },
    },
    adPricing: {
      featuredListing: { monthly: { type: Number, default: 250 } },
      categoryBanner: { monthly: { type: Number, default: 180 } },
      classifiedAd: { monthly: { type: Number, default: 120 } },
    },
    promoPricing: {
      topBanner: { monthly: { type: Number, default: 800 } },
      middleBanner: { monthly: { type: Number, default: 500 } },
      bottomBanner: { monthly: { type: Number, default: 300 } },
    },
    cravingsPricing: {
      daily: { type: Number, default: 25 },
      weekly: { type: Number, default: 140 },
    },
    priorityDeliveryMonthly: { type: Number, default: 150 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Settings", settingsSchema);
