const mongoose = require("mongoose");

const FeaturedListingSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    duration: {
      type: String,
      enum: ["30days", "90days", "1year"],
      required: true,
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "active", "expired"],
      default: "pending",
    },
    amountPaid: { type: Number },
    paypalOrderId: { type: String },
    autoRenew: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("FeaturedListing", FeaturedListingSchema);
