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

exports.sendGeneralContactEmail = async ({ name, email, subject, message }) => {
  const to = process.env.CONTACT_FORM_TO || process.env.ADMIN_EMAIL;

  if (!to) {
    throw new Error("Missing CONTACT_FORM_TO or ADMIN_EMAIL in environment");
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("Missing SMTP_USER or SMTP_PASS in environment");
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const text = [
    "New contact form submission from CayEats",
    `Your Name: ${name}`,
    `Email: ${email}`,
    `Subject: ${subject}`,
    `Message: ${message || "N/A"}`,
  ].join("\n");

  const html = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Your Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
    <p><strong>Message:</strong> ${escapeHtml(message || "N/A")}</p>
  `;

  await transporter.sendMail({
    from,
    to,
    replyTo: email,
    subject: `CayEats General Contact: ${subject}`,
    text,
    html,
  });
};

exports.sendReportIssueEmail = async ({
  name,
  email,
  issueType,
  description,
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
    "New issue report from CayEats",
    `Your Name: ${name}`,
    `Email: ${email}`,
    `Issue Type: ${issueType}`,
    `Description: ${description || "N/A"}`,
  ].join("\n");

  const html = `
    <h2>New Issue Report</h2>
    <p><strong>Your Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Issue Type:</strong> ${escapeHtml(issueType)}</p>
    <p><strong>Description:</strong> ${escapeHtml(description || "N/A")}</p>
  `;

  await transporter.sendMail({
    from,
    to,
    replyTo: email,
    subject: `CayEats Issue Report: ${issueType}`,
    text,
    html,
  });
};

exports.sendPasswordResetEmail = async ({ email, fullName, code }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("Missing SMTP_USER or SMTP_PASS in environment");
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const subject = "CayEats Password Reset Code";

  const text = [
    `Hello ${fullName || ""}`.trim(),
    "",
    "We received a request to reset your CayEats password.",
    `Your reset code is: ${code}`,
    "",
    "This code expires in 15 minutes.",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  const html = `
    <h2>Password Reset Code</h2>
    <p>Hello ${escapeHtml(fullName || "there")},</p>
    <p>We received a request to reset your CayEats password.</p>
    <p><strong>Your reset code is: ${escapeHtml(code)}</strong></p>
    <p>This code expires in 15 minutes.</p>
    <p>If you did not request this, you can ignore this email.</p>
  `;

  await transporter.sendMail({
    from,
    to: email,
    subject,
    text,
    html,
  });
};
