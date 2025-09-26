const mongoose = require("mongoose");
const { sendCriticalAlert } = require("../utils/alertUtils"); // Correct relative path

const ThreatSchema = new mongoose.Schema({
  source: { type: String, required: true },
  type: { type: String, required: true },
  indicator: { type: String, required: true },
  description: { type: String },
  severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
  date: { type: Date, default: Date.now },

  // Phase 6 enrichment fields
  geo: {
    country: String,
    region: String,
    city: String,
    latitude: Number,
    longitude: Number,
  },
  confidenceScore: { type: Number, default: 50 },
  correlatedSources: { type: [String], default: [] },

  // Phase 9 alert fields
  message: { type: String, default: "N/A" },
  details: { type: String, default: "N/A" },
});

// Trigger alerts after saving a new threat
ThreatSchema.post("save", async function (doc) {
  if (doc.severity === "high" || doc.severity === "critical") {
    console.log(`🚨 ALERT: ${doc.indicator} (${doc.severity})`);
    try {
      await sendCriticalAlert(doc); // Sends Slack + Email
    } catch (err) {
      console.error("Failed to send alert:", err.message);
    }
  }
});

module.exports = mongoose.model("Threat", ThreatSchema);
