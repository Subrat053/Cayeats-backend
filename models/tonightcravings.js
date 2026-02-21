const mongoose = require("mongoose");

const TonightsCravingSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    image: { type: String, required: true },
    headline: { type: String, required: true, maxlength: 60 },
    cta: { type: String, required: true, maxlength: 20 },
    duration: { type: String, enum: ["daily", "weekly"], required: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "active", "expired"],
      default: "pending",
    },
    amountPaid: { type: Number },
    paypalOrderId: { type: String },
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("TonightsCraving", TonightsCravingSchema);
