// models/Threat.js
const mongoose = require("mongoose");
const { sendCriticalAlert } = require("../utils/alertUtils");

const ThreatSchema = new mongoose.Schema({
  source: { type: String, required: true },
  type: { type: String, required: true },
  indicator: { type: String, required: true },
  description: { type: String, default: "N/A" },
  severity: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },
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
// POST-SAVE HOOK: SEND ALERTS
// ----------------------
ThreatSchema.post("save", async function (doc) {
  try {
    if (["high", "critical"].includes(doc.severity.toLowerCase())) {
      console.log(`🚨 ALERT: ${doc.indicator} (${doc.severity})`);
      await sendCriticalAlert(doc);
    }
  } catch (err) {
    console.error("❌ Failed to send alert for saved threat:", err);
  }
});

module.exports = mongoose.model("Threat", ThreatSchema);
