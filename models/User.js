const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    username: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer"],
      default: "customer",
    },
    isActive: { type: Boolean, default: true },
    resetCode: { type: String },
    resetCodeExpires: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
