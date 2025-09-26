// utils/email.js
const nodemailer = require("nodemailer");

const EMAIL_USER = process.env.ALERT_EMAIL_USER?.trim();
const EMAIL_PASS = process.env.ALERT_EMAIL_PASS?.trim();
const EMAIL_TO = process.env.ALERT_EMAIL_TO?.trim() || EMAIL_USER;

let transporter = null;
if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
} else {
  console.warn(
    "⚠️ ALERT_EMAIL_USER or ALERT_EMAIL_PASS not defined. Email alerts will fallback to console logs."
  );
}

/**
 * Send Email Alert for high-severity threat
 * @param {Object} threat - Threat document from MongoDB
 */
async function sendEmailAlert(threat) {
  if (!threat) return;

  const subject = `🚨 Critical Threat Detected: ${threat.indicator || "Unknown"}`;
  const text = `
🚨 CRITICAL THREAT DETECTED 🚨
Severity: ${threat.severity || "N/A"}
Indicator: ${threat.indicator || "N/A"}
Source: ${threat.source || "N/A"}
Message: ${threat.message || "N/A"}
Details: ${threat.details || "N/A"}
Time: ${new Date().toLocaleString()}
`;

  if (transporter) {
    const mailOptions = { from: `"Threat Alert System" <${EMAIL_USER}>`, to: EMAIL_TO, subject, text };
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Email alert sent:", info.response);
    } catch (err) {
      console.error("❌ Failed to send email alert:", err.message);
    }
  } else {
    console.log("[Email TEST ALERT]", text);
  }
}

module.exports = { sendEmailAlert };
