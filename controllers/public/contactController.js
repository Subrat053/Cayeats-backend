const { sendContactFormEmail } = require("../../utils/mailer");

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

    await sendContactFormEmail({
      restaurantName: String(restaurantName).trim(),
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: String(email).trim(),
      message: message ? String(message).trim() : "",
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
