const axios = require("axios");

async function sendSlackAlert(threat) {
  try {
    await axios.post(process.env.SLACK_WEBHOOK_URL, {
      text: `🚨 *High-Severity Threat Detected!*\n
*Name:* ${threat.name}
*Severity:* ${threat.severity}
*Source:* ${threat.source}
*Date:* ${threat.date}`
    });
    console.log("💬 Slack alert sent!");
  } catch (error) {
    console.error("❌ Slack alert error:", error.message);
  }
}

module.exports = sendSlackAlert;
