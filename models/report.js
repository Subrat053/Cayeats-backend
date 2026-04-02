const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    issueType: {
      type: String,
      enum: [
        "App not working",
        "Order issue",
        "Payment problem",
        "Delivery delay",
        "Restaurant information",
        "Food quality",
        "Other",
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      default: "open",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    adminReply: {
      type: String,
      default: "",
    },
    repliedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Report", reportSchema);
