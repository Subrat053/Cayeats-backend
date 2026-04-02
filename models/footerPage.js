const mongoose = require("mongoose");

const footerPageSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      enum: [
        "faq",
        "contact",
        "help",
        "about",
        "privacy",
        "terms",
        "cookies",
        "report-guidelines",
      ],
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    // For FAQ, store as array of Q&A
    faqs: [
      {
        question: String,
        answer: String,
      },
    ],
    // For Contact page
    contactInfo: {
      email: String,
      phone: String,
      address: String,
      hours: String,
    },
    // For general pages with sections
    sections: [
      {
        title: String,
        content: String,
      },
    ],
    // Last updated by admin
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("FooterPage", footerPageSchema);
