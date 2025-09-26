// utils/alertUtils.js
const { IncomingWebhook } = require('@slack/webhook');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

// ----------------------
// SLACK WEBHOOK
// ----------------------
const slackWebhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);

// ----------------------
// EMAIL TRANSPORTER
// ----------------------
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ALERT_EMAIL_USER,
    pass: process.env.ALERT_EMAIL_PASS
  }
});

// ----------------------
// SEND CRITICAL ALERT
// ----------------------
async function sendCriticalAlert(threat) {
  if (threat.severity.toLowerCase() !== 'high') return;

  const alertMessage = `
🚨 CRITICAL THREAT DETECTED 🚨
Severity: ${threat.severity}
Source: ${threat.source}
Type: ${threat.type}
IOC/Indicator: ${threat.indicator || 'N/A'}
Description/Details: ${threat.description || 'N/A'}
Time: ${new Date().toLocaleString()}
  `;

  try {
    console.log("📧 Sending email alert to:", process.env.ADMIN_EMAILS);
    console.log("💬 Sending Slack alert to webhook:", process.env.SLACK_WEBHOOK_URL);

    // Slack alert
    await slackWebhook.send({ text: alertMessage });

    // Email alert
    await transporter.sendMail({
      from: `"Threat Alert System" <${process.env.ALERT_EMAIL_USER}>`,
      to: process.env.ADMIN_EMAILS.split(","),
      subject: "🚨 Critical Threat Detected",
      text: alertMessage
    });

    console.log("✅ Critical alert sent via Slack & Email");
  } catch (error) {
    console.error("❌ Failed to send critical alert:", error);
  }
}

// ----------------------
// SEND DAILY REPORT
// ----------------------
async function sendDailyReport() {
  try {
    const reportPath = path.join(__dirname, '../exports/daily_report.csv');

    // Ensure exports folder exists
    if (!fs.existsSync(path.dirname(reportPath))) {
      fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    }

    // Ensure file exists
    if (!fs.existsSync(reportPath)) {
      console.warn("⚠️ Daily report file not found:", reportPath);
      return;
    }

    await transporter.sendMail({
      from: `"Threat Report System" <${process.env.ALERT_EMAIL_USER}>`,
      to: process.env.ADMIN_EMAILS.split(","),
      subject: "📊 Daily Threat Report",
      text: "Please find attached the daily threat report.",
      attachments: [
        {
          filename: 'daily_report.csv',
          path: reportPath
        }
      ]
    });

    console.log("✅ Daily report emailed to admins");
  } catch (error) {
    console.error("❌ Failed to send daily report:", error);
  }
}

// ----------------------
// SCHEDULE DAILY REPORTS (8 AM)
// ----------------------
function scheduleDailyReports() {
  cron.schedule('0 8 * * *', () => {
    console.log("📅 Sending scheduled daily report...");
    sendDailyReport();
  });
}

module.exports = {
  sendCriticalAlert,
  sendDailyReport,
  scheduleDailyReports
};
