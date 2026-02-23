const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    customerName: { type: String, default: "Guest" },
    customerPhone: { type: String, default: "" },
    customerNotes: { type: String, default: "" },
    deliveryAddress: { type: String, default: "" },
    deliveryProvider: { type: String, default: "" },
    items: [
      {
        name: String,
        quantity: Number,
        price: Number,
      },
    ],
    totalAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Pending", "Preparing", "Ready", "Delivered", "Cancelled"],
      default: "Pending",
    },
    estimatedDelivery: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
