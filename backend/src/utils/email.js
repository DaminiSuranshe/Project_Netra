const nodemailer = require("nodemailer");

// Create transporter using Gmail (or any SMTP)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ALERT_EMAIL_USER,
    pass: process.env.ALERT_EMAIL_PASS, // App password recommended
  },
});

/**
 * Send Email Alert for high-severity threat
 * @param {Object} threat - Threat document from MongoDB
 */
async function sendEmailAlert(threat) {
  if (!threat) return;

  // Prepare email content
  const subject = `🚨 Critical Threat Detected: ${threat.indicator}`;
  const text = `
🚨 CRITICAL THREAT DETECTED 🚨
Severity: ${threat.severity}
Indicator: ${threat.indicator}
Source: ${threat.source}
Message: ${threat.message}
Details: ${threat.details}
Time: ${new Date().toLocaleString()}
  `;

  const mailOptions = {
    from: `"Threat Alert System" <${process.env.ALERT_EMAIL_USER}>`,
    to: process.env.ALERT_EMAIL_TO || process.env.ALERT_EMAIL_USER, // fallback to sender
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    console.log("To:", mailOptions.to);
    console.log("Content:", text);
  } catch (err) {
    console.error("❌ Failed to send email alert:", err);
  }
}

module.exports = { sendEmailAlert };
