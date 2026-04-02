const {
  sendContactFormEmail,
  sendGeneralContactEmail,
  sendReportIssueEmail,
} = require("../../utils/mailer");
const Report = require("../../models/report");

const isValidEmail = (email = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());

exports.submitContactForm = async (req, res) => {
  try {
    const { restaurantName, name, phone, email, message } = req.body;

    if (!restaurantName || !name || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: "restaurantName, name, phone and email are required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Send email notification to admin (non-blocking)
    sendContactFormEmail({
      restaurantName: String(restaurantName).trim(),
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: String(email).trim(),
      message: message ? String(message).trim() : "",
    }).catch((emailError) => {
      console.error("Failed to send contact form email:", emailError.message);
    });

    return res.status(200).json({
      success: true,
      message: "Contact form submitted successfully",
    });
  } catch (error) {
    console.error("Contact form submission failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to submit contact form",
    });
  }
};

exports.submitGeneralContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "name, email, subject and message are required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Send email notification to admin (non-blocking)
    sendGeneralContactEmail({
      name: String(name).trim(),
      email: String(email).trim(),
      subject: String(subject).trim(),
      message: String(message).trim(),
    }).catch((emailError) => {
      console.error(
        "Failed to send general contact email:",
        emailError.message,
      );
    });

    return res.status(200).json({
      success: true,
      message: "Contact form submitted successfully",
    });
  } catch (error) {
    console.error("General contact form submission failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to submit contact form",
    });
  }
};

exports.submitReportIssue = async (req, res) => {
  try {
    const { name, email, issueType, description } = req.body;

    if (!name || !email || !issueType || !description) {
      return res.status(400).json({
        success: false,
        message: "name, email, issueType and description are required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Save report to database first
    const report = new Report({
      name: String(name).trim(),
      email: String(email).trim(),
      issueType: String(issueType).trim(),
      description: String(description).trim(),
      status: "open",
    });

    await report.save();

    // Send email notification to admin (non-blocking - don't wait for it)
    sendReportIssueEmail({
      name: String(name).trim(),
      email: String(email).trim(),
      issueType: String(issueType).trim(),
      description: String(description).trim(),
    }).catch((emailError) => {
      // Log email error but don't fail the request
      console.error(
        "Failed to send report notification email:",
        emailError.message,
      );
    });

    return res.status(200).json({
      success: true,
      message: "Issue report submitted successfully",
      reportId: report._id,
    });
  } catch (error) {
    console.error("Issue report submission failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to submit issue report",
    });
  }
};
