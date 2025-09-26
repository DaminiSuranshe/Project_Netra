const express = require("express");
const router = express.Router();
const Threat = require("../models/Threat");
const { sendCriticalAlert } = require("../utils/alertUtils");

router.post("/", async (req, res) => {
  try {
    const { ioc } = req.body;

    if (!ioc) return res.status(400).json({ error: "IoC is required" });

    // Example enrichment logic
    const enrichedThreat = {
      ioc,
      type: "ip",
      severity: "high", // replace with real API logic
      source: "AbuseIPDB",
      details: "Suspicious IP with multiple abuse reports"
    };

    const threat = await Threat.create(enrichedThreat);

    // Send alert if severity is high
    if (threat.severity.toLowerCase() === "high") {
      await sendCriticalAlert(threat);
    }

    res.json({ success: true, threat });
  } catch (error) {
    console.error("Correlation error:", error.message);
    res.status(500).json({ error: "Failed to correlate IoC" });
  }
});

module.exports = router;
