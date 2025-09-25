const mongoose = require("mongoose");

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

module.exports = mongoose.model("Threat", ThreatSchema);
