const mongoose = require("mongoose");

const PreferredDeliverySchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    providerName: { type: String, required: true },
    duration: { type: String, enum: ["6months", "1year"], required: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["active", "expired"], default: "active" },
    amountPaid: { type: Number },
    paypalOrderId: { type: String },
    autoRenew: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PreferredDelivery", PreferredDeliverySchema);
