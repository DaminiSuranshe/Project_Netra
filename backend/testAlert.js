// backend/testAlert.js
require("dotenv").config();
const { sendCriticalAlert } = require("./utils/alertUtils");

async function testAlerts() {
  const dummyThreat = {
    name: "Test Malware",
    severity: "high",
    source: "UnitTest",
    message: "This is a test critical threat",
    details: "No real impact, just testing alerts",
  };

  console.log("🚀 Sending test alerts...");
  await sendCriticalAlert(dummyThreat);
  console.log("✅ Test alerts sent (check your Slack & Email)!");
}

testAlerts();
