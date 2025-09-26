// backend/src/routes/ioc.js

// ----------------------
// IMPORTS
// ----------------------
const express = require("express");
const router = express.Router();
const Threat = require("../models/Threat");
const { fetchThreatData } = require("../utils/fetchThreats"); // helper to fetch data from AbuseIPDB, OTX, VirusTotal

// ----------------------
// POST /lookup
// ----------------------
router.post("/lookup", async (req, res) => {
  const { type, value } = req.body;

  if (!type || !value) {
    return res.status(400).json({ error: "Type and value required" });
  }

  try {
    // Fetch threats from external sources
    const threatResults = await fetchThreatData(value);

    // Save valid results to MongoDB
    const savedThreats = [];
    for (const t of threatResults) {
      if (!t.error) {
        const doc = await Threat.create({
          source: t.source,
          type,
          indicator: t.indicator,
          severity: t.severity,
          confidenceScore: t.confidenceScore || 50,
          pulseCount: t.pulseCount,
          lastAnalysisStats: t.lastAnalysisStats,
          message: "Fetched from external threat intelligence",
          details: JSON.stringify(t),
        });
        savedThreats.push(doc);
      }
    }

    res.json({ results: savedThreats, rawResults: threatResults });

  } catch (err) {
    console.error("❌ Lookup Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------
// EXPORT ROUTER
// ----------------------
module.exports = router;
