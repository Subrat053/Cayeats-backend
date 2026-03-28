const nodemailer = require("nodemailer");

const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpSecure =
  String(process.env.SMTP_SECURE || "true").toLowerCase() === "true";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.zoho.com",
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

exports.sendContactFormEmail = async ({
  restaurantName,
  name,
  phone,
  email,
  message,
}) => {
  const to = process.env.CONTACT_FORM_TO || process.env.ADMIN_EMAIL;

  if (!to) {
    throw new Error("Missing CONTACT_FORM_TO or ADMIN_EMAIL in environment");
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("Missing SMTP_USER or SMTP_PASS in environment");
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const text = [
    "New contact form submission from CayEats landing page",
    `Restaurant Name: ${restaurantName}`,
    `Your Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email}`,
    `Message: ${message || "N/A"}`,
  ].join("\n");

  const html = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Restaurant Name:</strong> ${escapeHtml(restaurantName)}</p>
    <p><strong>Your Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Message:</strong> ${escapeHtml(message || "N/A")}</p>
  `;

  await transporter.sendMail({
    from,
    to,
    replyTo: email,
    subject: `CayEats Contact: ${restaurantName}`,
    text,
    html,
  });
};
