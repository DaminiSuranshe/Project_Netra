const nodemailer = require("nodemailer");
require("dotenv").config(); // Load .env variables

async function sendTestEmail() {
  try {
    // Setup transporter with Gmail + App Password
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ALERT_EMAIL_USER,
        pass: process.env.ALERT_EMAIL_PASS, // App password, not your normal Gmail password
      },
    });

    // Email content
    let info = await transporter.sendMail({
      from: `"Netra Alerts" <${process.env.ALERT_EMAIL_USER}>`,
      to: process.env.ALERT_EMAIL_TO,
      subject: "🚨 Test Alert from Netra",
      text: "This is a test email alert from your Netra backend 🚀",
    });

    console.log("✅ Email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Email sending failed:", err.message);
  }
}

// Run test
sendTestEmail();
