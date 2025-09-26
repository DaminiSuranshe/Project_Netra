// utils/alertUtils.js

const { IncomingWebhook } = require("@slack/webhook");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

// ----------------------
// SLACK WEBHOOK
// ----------------------
const slackWebhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);

// ----------------------
// EMAIL TRANSPORTER
// ----------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ALERT_EMAIL_USER,
    pass: process.env.ALERT_EMAIL_PASS, // Gmail App Password
  },
});

// Verify transporter
transporter.verify((err, success) => {
  if (err) console.error("❌ Email transporter verification failed:", err);
  else console.log("✅ Email transporter ready");
});

// ----------------------
// SEND CRITICAL ALERT
// ----------------------
async function sendCriticalAlert(threat) {
  if (!threat || !["high", "critical"].includes(threat.severity.toLowerCase())) return;

  const alertText = `
🚨 CRITICAL THREAT DETECTED 🚨
Severity: ${threat.severity}
Indicator: ${threat.indicator || "N/A"}
Source: ${threat.source || "N/A"}
Message: ${threat.message || "N/A"}
Details: ${threat.details || "N/A"}
Time: ${new Date().toLocaleString()}
`;

  // ---- Slack ----
  try {
    await slackWebhook.send({ text: alertText });
    console.log("✅ Slack alert sent");
  } catch (err) {
    console.error("❌ Slack alert failed:", err);
  }

  // ---- Email ----
  try {
    const mailOptions = {
      from: `"Threat Alert System" <${process.env.ALERT_EMAIL_USER}>`,
      to: process.env.ALERT_EMAIL_TO || process.env.ALERT_EMAIL_USER,
      subject: `🚨 Critical Threat Detected: ${threat.indicator || "Unknown"}`,
      text: alertText,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email alert sent:", info.response);
  } catch (err) {
    console.error("❌ Email alert failed:", err);
  }
}

// ----------------------
// SEND DAILY REPORT
// ----------------------
async function sendDailyReport() {
  try {
    const reportPath = path.join(__dirname, "../exports/daily_report.csv");

    if (!fs.existsSync(reportPath)) {
      console.warn("⚠️ Daily report file not found:", reportPath);
      return;
    }

    const mailOptions = {
      from: `"Threat Report System" <${process.env.ALERT_EMAIL_USER}>`,
      to: process.env.ALERT_EMAIL_TO || process.env.ALERT_EMAIL_USER,
      subject: "📊 Daily Threat Report",
      text: "Please find attached the daily threat report.",
      attachments: [
        {
          filename: "daily_report.csv",
          path: reportPath,
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Daily report emailed:", info.response);
  } catch (err) {
    console.error("❌ Failed to send daily report:", err);
  }
}

// ----------------------
// SCHEDULE DAILY REPORTS (8 AM every day)
// ----------------------
function scheduleDailyReports() {
  cron.schedule("0 8 * * *", () => {
    console.log("📅 Sending scheduled daily report...");
    sendDailyReport();
  });
}

// ----------------------
// EXPORTS
// ----------------------
module.exports = {
  sendCriticalAlert,
  sendDailyReport,
  scheduleDailyReports,
};
