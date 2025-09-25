const mongoose = require("mongoose");
const sendEmailAlert = require("../utils/email");
const sendSlackAlert = require("../utils/slack");

const ThreatSchema = new mongoose.Schema({
  source: { type: String, required: true },
  type: { type: String, required: true },
  indicator: { type: String, required: true },
  description: { type: String },
  severity: { type: String, default: "Medium" },
  date: { type: Date, default: Date.now },
  // Phase 6 fields
  geo: {
    country: String,
    region: String,
    city: String,
    latitude: Number,
    longitude: Number,
  },
  confidenceScore: { type: Number, default: 50 },
  geo: {
    country: String,
    region: String,
    city: String,
    latitude: Number,
    longitude: Number,
  },
  confidenceScore: { type: Number, default: 50 },
  correlatedSources: { type: [String], default: [] },
});

const threatSchema = new mongoose.Schema({
  name: String,
  severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "low" },
  source: String,
  date: { type: Date, default: Date.now }
});

// Trigger alerts after saving a new threat
threatSchema.post("save", function (doc) {
  if (doc.severity === "high" || doc.severity === "critical") {
    console.log(`🚨 ALERT: ${doc.name} (${doc.severity})`);
    sendEmailAlert(doc);
    sendSlackAlert(doc);
  }
});

module.exports = mongoose.model("Threat", ThreatSchema);
