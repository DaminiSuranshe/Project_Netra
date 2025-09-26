const express = require("express");
const router = express.Router();
const Threat = require("../models/Threat");
const { Parser } = require("json2csv");

// ----------------------
// GET /api/dashboard/summary
// Threat counts by severity and source
// ----------------------
router.get("/summary", async (req, res) => {
  try {
    const severityCounts = await Threat.aggregate([
      { $group: { _id: "$severity", count: { $sum: 1 } } }
    ]);
    const sourceCounts = await Threat.aggregate([
      { $group: { _id: "$source", count: { $sum: 1 } } }
    ]);
    res.json({ severityCounts, sourceCounts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------
// GET /api/dashboard/geodata
// Threats with geo coordinates for map
// ----------------------
router.get("/geodata", async (req, res) => {
  try {
    const geoData = await Threat.find(
      { "geo.latitude": { $exists: true }, "geo.longitude": { $exists: true } },
      "geo severity source"
    );
    res.json(geoData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------
// GET /api/dashboard/report/daily
// Download daily threats as CSV
// ----------------------
router.get("/report/daily", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threats = await Threat.find({ date: { $gte: today } });

    const fields = ["date", "source", "type", "indicator", "severity", "message"];
    const parser = new Parser({ fields });
    const csv = parser.parse(threats);

    res.header("Content-Type", "text/csv");
    res.attachment("daily_report.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
