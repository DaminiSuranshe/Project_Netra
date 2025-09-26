// utils/alertUtils.js
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const { IncomingWebhook } = require("@slack/webhook");

// ----------------------
// SLACK WEBHOOK SETUP
// ----------------------
const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL?.trim();
let slackWebhook = null;

if (slackWebhookUrl) {
  slackWebhook = new IncomingWebhook(slackWebhookUrl);
} else {
  console.warn(
    "⚠️ SLACK_WEBHOOK_URL not defined or empty. Slack alerts will fallback to console logs."
  );
}

// ----------------------
// EMAIL TRANSPORTER SETUP
// ----------------------
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
    "⚠️ ALERT_EMAIL_USER or ALERT_EMAIL_PASS not defined or empty. Email alerts will fallback to console logs."
  );
}

// ----------------------
// SEND CRITICAL ALERT
// ----------------------
async function sendCriticalAlert(threat) {
  if (!threat || !["high", "critical"].includes(threat.severity?.toLowerCase()))
    return;

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
  if (slackWebhook) {
    try {
      await slackWebhook.send({ text: alertText });
      console.log("✅ Slack alert sent");
    } catch (err) {
      console.error("❌ Slack alert failed:", err.message);
    }
  } else {
    console.log("[Slack TEST ALERT]", alertText);
  }

  // ---- Email ----
  if (transporter) {
    try {
      const mailOptions = {
        from: `"Threat Alert System" <${EMAIL_USER}>`,
        to: EMAIL_TO,
        subject: `🚨 Critical Threat Detected: ${threat.indicator || "Unknown"}`,
        text: alertText,
      };
      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Email alert sent:", info.response);
    } catch (err) {
      console.error("❌ Email alert failed:", err.message);
    }
  } else {
    console.log("[Email TEST ALERT]", alertText);
  }
}

// ----------------------
// SEND DAILY REPORT
// ----------------------
async function sendDailyReport() {
  const reportPath = path.join(__dirname, "../exports/daily_report.csv");

  if (!fs.existsSync(reportPath)) {
    console.warn("⚠️ Daily report file not found:", reportPath);
    return;
  }

  const reportText = "📊 Daily Threat Report attached: " + reportPath;

  if (transporter) {
    try {
      const mailOptions = {
        from: `"Threat Report System" <${EMAIL_USER}>`,
        to: EMAIL_TO,
        subject: "📊 Daily Threat Report",
        text: "Please find attached the daily threat report.",
        attachments: [{ filename: "daily_report.csv", path: reportPath }],
      };
      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Daily report sent:", info.response);
    } catch (err) {
      console.error("❌ Daily report email failed:", err.message);
    }
  } else {
    console.log("[Daily Report TEST]", reportText);
  }
}

// ----------------------
// SCHEDULE DAILY REPORTS (8 AM)
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
