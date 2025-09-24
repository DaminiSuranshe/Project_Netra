const mongoose = require("mongoose");

const threatSchema = new mongoose.Schema({
  source: { type: String, required: true }, // AbuseIPDB, OTX, VirusTotal, CISA
  type: { type: String }, // IP, Domain, Hash, etc.
  indicator: { type: String, required: true },
  description: { type: String },
  severity: { type: String },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Threat", threatSchema);
