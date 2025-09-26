const express = require("express");
const Threat = require("../models/Threat");
const { Parser } = require("json2csv");
const { authMiddleware } = require("./auth");

const router = express.Router();

// Lookup threats with filters
router.get("/", authMiddleware(), async (req, res) => {
  const { type, severity, source } = req.query;
  const query = {};
  if (type) query.type = type;
  if (severity) query.severity = severity.toLowerCase();
  if (source) query.source = source;

  const results = await Threat.find(query);
  res.json({ results });
});

// Export threats as CSV
router.get("/export", authMiddleware(), async (req, res) => {
  const threats = await Threat.find();
  const parser = new Parser();
  const csv = parser.parse(threats);
  res.header("Content-Type", "text/csv");
  res.attachment("threat_report.csv");
  res.send(csv);
});

module.exports = router;
