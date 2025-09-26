// utils/slack.js
const axios = require("axios");

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL?.trim();

if (!SLACK_WEBHOOK_URL) {
  console.warn(
    "⚠️ SLACK_WEBHOOK_URL not defined or empty. Slack alerts will be skipped."
  );
}

/**
 * Send Slack Alert for high-severity threat
 * @param {Object} threat - Threat document from MongoDB
 */
async function sendSlackAlert(threat) {
  if (!threat) return;
  if (!SLACK_WEBHOOK_URL) return;

  const alertText = `
🚨 *CRITICAL THREAT DETECTED!* 🚨
*Name:* ${threat.name || "N/A"}
*Severity:* ${threat.severity || "N/A"}
*Indicator:* ${threat.indicator || "N/A"}
*Source:* ${threat.source || "N/A"}
*Message:* ${threat.message || "N/A"}
*Details:* ${threat.details || "N/A"}
*Time:* ${new Date().toLocaleString()}
`;

  try {
    await axios.post(SLACK_WEBHOOK_URL, { text: alertText });
    console.log("✅ Slack alert sent!");
  } catch (err) {
    console.error("❌ Slack alert failed:", err.message);
  }
}

module.exports = { sendSlackAlert };
