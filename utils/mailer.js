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

exports.sendRestaurantApprovalEmail = async ({ email, restaurantName }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("Missing SMTP_USER or SMTP_PASS in environment");
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const subject = "🎉 Your Restaurant Has Been Approved on CayEats!";

  const text = [
    `Hello ${restaurantName || "Restaurant Owner"}!`,
    "",
    "Great news! Your restaurant has been approved and is now live on CayEats.",
    "",
    "You can now:",
    "- Manage your restaurant profile and settings",
    "- Upload menu items and images",
    "- View and manage orders",
    "- Access your analytics dashboard",
    "",
    "Log in to your dashboard to get started: " +
      (process.env.FRONTEND_URL || "https://cayeats.com"),
    "",
    "If you have any questions, feel free to contact us.",
    "",
    "Welcome to CayEats!",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">🎉 Congratulations!</h2>
      <p>Hello <strong>${escapeHtml(restaurantName || "Restaurant Owner")}</strong>,</p>
      <p>Great news! Your restaurant has been <span style="color: #22c55e; font-weight: bold;">approved</span> and is now live on CayEats.</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1f2937;">You can now:</h3>
        <ul style="color: #4b5563;">
          <li>✅ Manage your restaurant profile and settings</li>
          <li>✅ Upload menu items and images</li>
          <li>✅ View and manage orders</li>
          <li>✅ Access your analytics dashboard</li>
        </ul>
      </div>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || "https://cayeats.com"}" style="background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          Go to Your Dashboard
        </a>
      </p>
      
      <p style="color: #6b7280;">If you have any questions, feel free to contact our support team.</p>
      <p style="color: #6b7280;">Welcome to CayEats!</p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">© 2026 CayEats. All rights reserved.</p>
    </div>
  `;

  await transporter.sendMail({
    from,
    to: email,
    subject,
    text,
    html,
  });
};

exports.sendRestaurantRejectionEmail = async ({
  email,
  restaurantName,
  reason = "Your application does not meet our current requirements.",
}) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("Missing SMTP_USER or SMTP_PASS in environment");
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const subject = "Update on Your CayEats Restaurant Application";

  const text = [
    `Hello ${restaurantName || "Restaurant Owner"}!`,
    "",
    "Thank you for applying to list your restaurant on CayEats.",
    "",
    "Unfortunately, your application was not approved at this time.",
    "",
    `Reason: ${reason}`,
    "",
    "You can reapply once you've addressed the concerns mentioned above.",
    "If you have any questions or need clarification, please contact us.",
    "",
    "Best regards,",
    "The CayEats Team",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">Update on Your Application</h2>
      <p>Hello <strong>${escapeHtml(restaurantName || "Restaurant Owner")}</strong>,</p>
      <p>Thank you for applying to list your restaurant on CayEats.</p>
      
      <div style="background-color: #fef2f2; padding: 20px; border-left: 4px solid #ef4444; border-radius: 8px; margin: 20px 0;">
        <p style="color: #7f1d1d; margin: 0;">
          <strong>Status: Not Approved</strong>
        </p>
        <p style="color: #991b1b; margin: 10px 0 0 0;">
          ${escapeHtml(reason)}
        </p>
      </div>
      
      <p style="color: #4b5563;">You can reapply once you've addressed the concerns mentioned above. We'd love to have your restaurant on CayEats!</p>
      
      <p style="color: #6b7280;">If you have any questions or need clarification, please don't hesitate to contact our support team.</p>
      
      <p style="color: #6b7280; margin-top: 30px;">Best regards,<br><strong>The CayEats Team</strong></p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">© 2026 CayEats. All rights reserved.</p>
    </div>
  `;

  await transporter.sendMail({
    from,
    to: email,
    subject,
    text,
    html,
  });
};
