const express = require("express");
const Threat = require("../models/Threat");
const { Parser } = require("json2csv");

// Correct path to your middleware
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Lookup threats with filters
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { type, severity, source } = req.query;
    const query = {};
    if (type) query.type = type;
    if (severity) query.severity = severity.toLowerCase();
    if (source) query.source = source;

    const results = await Threat.find(query);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export threats as CSV
router.get("/export", authMiddleware, async (req, res) => {
  try {
    const threats = await Threat.find();
    const parser = new Parser();
    const csv = parser.parse(threats);
    res.header("Content-Type", "text/csv");
    res.attachment("threat_report.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
