// models/Threat.js
const mongoose = require("mongoose");
const { sendCriticalAlert } = require("../utils/alertUtils");

const ThreatSchema = new mongoose.Schema({
  source: { type: String, required: true },
  type: { type: String, required: true },
  indicator: { type: String, required: true },
  description: { type: String },
  severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
  date: { type: Date, default: Date.now },

  // ----------------------
  // Phase 6 enrichment
  // ----------------------
  geo: {
    country: String,
    region: String,
    city: String,
    latitude: Number,
    longitude: Number,
  },
  confidenceScore: { type: Number, default: 50 },
  correlatedSources: { type: [String], default: [] },

  // ----------------------
  // Phase 9 alert info
  // ----------------------
  message: { type: String, default: "N/A" },  // Short alert message
  details: { type: String, default: "N/A" },  // Detailed threat info
});

// ----------------------
// Trigger alerts after saving a new threat
// ----------------------
ThreatSchema.post("save", async function (doc) {
  try {
    if (["high", "critical"].includes(doc.severity.toLowerCase())) {
      console.log(`🚨 ALERT: ${doc.indicator} (${doc.severity})`);
      await sendCriticalAlert(doc);
    }
  } catch (err) {
    console.error("❌ Failed to send alert:", err);
  }
});

module.exports = mongoose.model("Threat", ThreatSchema);
