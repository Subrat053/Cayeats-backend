const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "restaurant_claim",
        "featured_listing",
        "tonights_cravings",
        "banner_ad",
        "preferred_delivery",
      ],
      required: true,
    },
    description: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    paymentMethod: { type: String, default: "PayPal" },
    paypalOrderId: { type: String },
    autoRenew: { type: Boolean, default: true },
    renewDate: { type: Date },
    failureReason: { type: String },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
