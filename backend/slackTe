const axios = require("axios");
require("dotenv").config(); // Load .env variables

async function sendSlackAlert(message) {
  try {
    await axios.post(process.env.SLACK_WEBHOOK_URL, { text: message });
    console.log("✅ Slack alert sent!");
  } catch (err) {
    console.error("❌ Slack alert failed:", err.message);
  }
}

// Send a test message
sendSlackAlert("🚨 Test alert from Netra backend! 🚨");
