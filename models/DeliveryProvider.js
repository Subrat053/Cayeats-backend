const mongoose = require("mongoose");

const DeliveryProviderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    website: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    commission: { type: Number, default: 0 }, // percentage
    notes: { type: String },
    isActive: { type: Boolean, default: true },
    totalClicks: { type: Number, default: 0 }, // aggregate clicks across restaurants
    restaurantCount: { type: Number, default: 0 }, // count of restaurants using this provider
  },
  { timestamps: true },
);

module.exports = mongoose.model("DeliveryProvider", DeliveryProviderSchema);
