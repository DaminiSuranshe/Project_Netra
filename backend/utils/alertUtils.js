const { IncomingWebhook } = require('@slack/webhook');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

// Slack webhook
const slackWebhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ALERT_EMAIL_USER,
    pass: process.env.ALERT_EMAIL_PASS
  }
});

/**
 * Send critical Slack + Email alert
 */
async function sendCriticalAlert(threat) {
  if (threat.severity.toLowerCase() !== 'high') return;

  const alertMessage = `
🚨 CRITICAL THREAT DETECTED 🚨
Severity: ${threat.severity}
Source: ${threat.source}
Type: ${threat.type}
Message: ${threat.message || 'N/A'}
Details: ${threat.details || 'N/A'}
Time: ${new Date().toLocaleString()}
  `;

  try {
    // Slack alert
    await slackWebhook.send({ text: alertMessage });

    // Email alert
    await transporter.sendMail({
      from: `"Threat Alert System" <${process.env.ALERT_EMAIL_USER}>`,
      to: process.env.ADMIN_EMAILS,
      subject: "🚨 Critical Threat Detected",
      text: alertMessage
    });

    console.log("✅ Critical alert sent via Slack & Email");
  } catch (error) {
    console.error("❌ Failed to send alert:", error);
  }
}

/**
 * Send daily report as email (attaches CSV)
 */
async function sendDailyReport() {
  try {
    const reportPath = path.join(__dirname, '../exports/daily_report.csv');

    if (!fs.existsSync(reportPath)) {
      console.warn("⚠️ Daily report file not found:", reportPath);
      return;
    }

    await transporter.sendMail({
      from: `"Threat Report System" <${process.env.ALERT_EMAIL_USER}>`,
      to: process.env.ADMIN_EMAILS,
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

/**
 * Schedule daily report at 8 AM every day
 */
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
