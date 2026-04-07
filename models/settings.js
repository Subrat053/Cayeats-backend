const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    branding: {
      logoUrl: { type: String, default: "/assets/cayeats-rmbg.png" },
      faviconUrl: { type: String, default: "/favicon.ico" },
      siteName: { type: String, default: "CayEats" },
      tagline: {
        type: String,
        default: "Cayman Islands Food Delivery & Restaurant Guide",
      },
      primaryColor: { type: String, default: "#E63946" },
      secondaryColor: { type: String, default: "#1D3557" },
    },
    payments: {
      paypalEnabled: { type: Boolean, default: true },
      paypalClientId: { type: String, default: "" },
      paypalSecret: { type: String, default: "" },
      paypalMode: {
        type: String,
        default: "sandbox",
        enum: ["sandbox", "live"],
      },
      stripeEnabled: { type: Boolean, default: false },
      stripePublicKey: { type: String, default: "" },
      stripeSecretKey: { type: String, default: "" },
      currency: { type: String, default: "USD" },
      taxRate: { type: Number, default: 0 },
    },
    notifications: {
      emailNewOrder: { type: Boolean, default: true },
      emailNewClaim: { type: Boolean, default: true },
      emailNewSubscription: { type: Boolean, default: true },
      emailWeeklyReport: { type: Boolean, default: true },
      adminEmail: { type: String, default: "admin@cayeats.com" },
    },
    claimPricing: {
      semiAnnual: { type: Number, default: 160 },
      annual: { type: Number, default: 240 },
    },
    yearlyDiscounts: {
      year1: { type: Number, default: 50 }, // % off year 1
      year2: { type: Number, default: 25 }, // % off year 2
      year3: { type: Number, default: 25 }, // % off year 3
    },
    // Legacy field - keeping for backward compatibility
    firstYearDiscount: { type: Number, default: 50 },
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
    footer: {
      discover: [
        {
          label: { type: String, default: "All Restaurants" },
          href: { type: String, default: "/restaurants" },
        },
        {
          label: { type: String, default: "Cuisines" },
          href: { type: String, default: "/cuisines" },
        },
        {
          label: { type: String, default: "Tonight's Cravings" },
          href: { type: String, default: "/cravings" },
        },
        {
          label: { type: String, default: "Featured Restaurants" },
          href: { type: String, default: "/restaurants?featured=true" },
        },
      ],
      forBusiness: [
        {
          label: { type: String, default: "Partner With Us" },
          href: { type: String, default: "/partner" },
        },
        {
          label: { type: String, default: "Restaurant Sign Up" },
          href: { type: String, default: "/register?type=restaurant" },
        },
        {
          label: { type: String, default: "Delivery Partners" },
          href: { type: String, default: "/register?type=delivery" },
        },
        {
          label: { type: String, default: "Advertising" },
          href: { type: String, default: "/advertise" },
        },
      ],
      support: [
        {
          label: { type: String, default: "Help Center" },
          href: { type: String, default: "/help" },
        },
        {
          label: { type: String, default: "Contact Us" },
          href: { type: String, default: "/contact" },
        },
        {
          label: { type: String, default: "FAQ" },
          href: { type: String, default: "/faq" },
        },
        {
          label: { type: String, default: "Report an Issue" },
          href: { type: String, default: "/report" },
        },
      ],
      legal: [
        {
          label: { type: String, default: "Terms of Service" },
          href: { type: String, default: "/terms" },
        },
        {
          label: { type: String, default: "Privacy Policy" },
          href: { type: String, default: "/privacy" },
        },
        {
          label: { type: String, default: "Cookie Policy" },
          href: { type: String, default: "/cookies" },
        },
      ],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Settings", settingsSchema);
