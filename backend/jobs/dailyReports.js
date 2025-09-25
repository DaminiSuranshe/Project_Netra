const cron = require("node-cron");
const fs = require("fs");
const Threat = require("../models/Threat");

cron.schedule("0 9 * * *", async () => {
  console.log("📄 Generating daily report...");
  const threats = await Threat.find({}); // all threats
  const report = threats.map(t => `${t.name},${t.severity},${t.date}`).join("\n");
  fs.writeFileSync("reports/daily_report.csv", report);
  console.log("✅ Daily report generated.");
});
