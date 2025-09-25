const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // or "Outlook", "Yahoo"
  auth: {
    user: process.env.ALERT_EMAIL_USER, // your email
    pass: process.env.ALERT_EMAIL_PASS  // app password (not plain pwd)
  }
});

async function sendEmailAlert(threat) {
  const mailOptions = {
    from: `"Threat Monitor" <${process.env.ALERT_EMAIL_USER}>`,
    to: process.env.ALERT_EMAIL_TO, // comma-separated if multiple
    subject: `🚨 High-Severity Threat Alert: ${threat.name}`,
    text: `A new high-severity threat has been detected.\n\n
Name: ${threat.name}
Severity: ${threat.severity}
Source: ${threat.source}
Date: ${threat.date}\n\nStay safe!`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 Email alert sent!");
  } catch (error) {
    console.error("❌ Email alert error:", error.message);
  }
}

module.exports = sendEmailAlert;
