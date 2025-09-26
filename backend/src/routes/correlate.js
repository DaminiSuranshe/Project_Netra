const express = require("express");
const router = express.Router();
const Threat = require("../models/Threat");
const { sendCriticalAlert } = require("../utils/alertUtils");

router.post("/", async (req, res) => {
  try {
    const { ioc } = req.body;

    if (!ioc) {
      return res.status(400).json({ error: "IoC is required" });
    }

    // Dummy correlation/enrichment logic
    const enrichedThreat = {
      indicator: ioc,
      type: "ip",
      severity: "high",
      source: "AbuseIPDB",
      description: "Suspicious IP detected via correlation",
      message: `Critical correlated threat: ${ioc}`,
      details: `IoC: ${ioc}, Source: AbuseIPDB, Severity: High, Correlated via multiple sources`,
      geo: { country: "US", region: "California", city: "San Francisco" },
      confidenceScore: 90,
      correlatedSources: ["AbuseIPDB", "VirusTotal"]
    };

    const threat = await Threat.create(enrichedThreat);

    // Trigger alerts automatically
    if (threat.severity === "high" || threat.severity === "critical") {
      await sendCriticalAlert(threat);
    }

    res.json({ success: true, threat });
  } catch (error) {
    console.error("Correlation Error:", error);
    res.status(500).json({ error: "Failed to correlate IoC" });
  }
});

module.exports = router;
