const mongoose = require("mongoose");
const { sendEmailAlert } = require("../utils/email");
const { sendSlackAlert } = require("../utils/slack");

const ThreatSchema = new mongoose.Schema({
  source: { type: String, required: true, default: "Unknown" },
  type: { type: String, required: true, default: "Unknown" },
  indicator: { type: String, required: true, default: "N/A" },
  description: { type: String, default: "N/A" },
  severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
  date: { type: Date, default: Date.now },

  // Phase 6 enrichment fields
  geo: {
    country: { type: String, default: "N/A" },
    region: { type: String, default: "N/A" },
    city: { type: String, default: "N/A" },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
  },
  confidenceScore: { type: Number, default: 50 },
  correlatedSources: { type: [String], default: [] },

  // Phase 9 alert fields
  message: { type: String, default: "N/A" },
  details: { type: String, default: "N/A" },
});

// ----------------------
// Post-save hook: trigger alerts
// ----------------------
ThreatSchema.post("save", async function (doc) {
  if (!doc) return;

  // Only trigger for high or critical threats
  if (doc.severity.toLowerCase() === "high" || doc.severity.toLowerCase() === "critical") {
    console.log(`🚨 ALERT TRIGGERED: ${doc.indicator} (${doc.severity})`);

    // Wrap each alert in try/catch to prevent one failure from blocking the other
    try {
      await sendEmailAlert(doc);
      console.log("✅ Email alert sent successfully");
    } catch (err) {
      console.error("❌ Email alert failed:", err.message);
    }

    try {
      await sendSlackAlert(doc);
      console.log("✅ Slack alert sent successfully");
    } catch (err) {
      console.error("❌ Slack alert failed:", err.message);
    }
  }
});

module.exports = mongoose.model("Threat", ThreatSchema);
