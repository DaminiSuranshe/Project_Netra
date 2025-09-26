const mongoose = require("mongoose");
const { sendCriticalAlert } = require("../utils/alertUtils");

const ThreatSchema = new mongoose.Schema({
  source: { type: String, required: true },
  type: { type: String, required: true },
  indicator: { type: String, required: true },
  description: { type: String },
  severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
  date: { type: Date, default: Date.now },
  geo: {
    country: String,
    region: String,
    city: String,
    latitude: Number,
    longitude: Number,
  },
  confidenceScore: { type: Number, default: 50 },
  correlatedSources: { type: [String], default: [] },
  message: { type: String, default: "N/A" },
  details: { type: String, default: "N/A" },
});

ThreatSchema.post("save", async function (doc) {
  if (["high", "critical"].includes(doc.severity.toLowerCase())) {
    console.log(`🚨 ALERT: ${doc.indicator} (${doc.severity})`);
    await sendCriticalAlert(doc);
  }
});

module.exports = mongoose.model("Threat", ThreatSchema);
