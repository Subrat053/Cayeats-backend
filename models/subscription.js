import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
  },
  plan: String,
  expiresAt: Date,
  autoRenew: { type: Boolean, default: true },
});

export default mongoose.model("Subscription", subscriptionSchema);
