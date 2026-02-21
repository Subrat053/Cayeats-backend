const mongoose = require("mongoose");

const BannerAdSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    zone: { type: String, enum: ["top", "middle", "bottom"], required: true },
    image: { type: String, required: true },
    headline: { type: String, required: true, maxlength: 80 },
    description: { type: String, maxlength: 200 },
    cta: { type: String, maxlength: 25 },
    url: { type: String },
    duration: {
      type: String,
      enum: ["monthly", "semiAnnual", "annual"],
      required: true,
    },
    startDate: { type: Date },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "active", "expired"],
      default: "pending",
    },
    amountPaid: { type: Number },
    paypalOrderId: { type: String },
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    autoRenew: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("BannerAd", BannerAdSchema);
