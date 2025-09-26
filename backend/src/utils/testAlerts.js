// backend/src/utils/testAlerts.js

require('dotenv').config();
const { sendCriticalAlert } = require('./alertUtils');

async function testAlerts() {
  const testThreat = {
    severity: "high",
    indicator: "127.0.0.1",
    source: "Test Script",
    message: "This is a test alert",
    details: "Verifying Slack & Email alert system"
  };

  try {
    console.log("📤 Sending test alert...");
    await sendCriticalAlert(testThreat);
    console.log("✅ Test alert sent. Check Slack and email inbox.");
  } catch (err) {
    console.error("❌ Test alert failed:", err.message);
  }
}

testAlerts();
