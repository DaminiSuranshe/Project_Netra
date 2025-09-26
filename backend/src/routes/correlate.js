// ----------------------
// IMPORTS
// ----------------------
const express = require("express");
const router = express.Router();
const axios = require("axios");
const Threat = require("../models/Threat");
const { sendCriticalAlert } = require("../utils/alertUtils"); // ✅ add this

// ----------------------
// CORRELATION ROUTE
// ----------------------
router.post("/", async (req, res) => {
  try {
    const { ioc } = req.body; // IoC from frontend

    if (!ioc) {
      return res.status(400).json({ error: "IoC is required" });
    }

    // Dummy enrichment (replace with AbuseIPDB, OTX, VT lookups as needed)
    const enrichedThreat = {
      ioc,
      type: "ip",
      severity: "high", // <-- replace with real logic from API responses
      source: "AbuseIPDB",
      details: "Suspicious IP with multiple abuse reports"
    };

    // Save in DB
    const threat = await Threat.create(enrichedThreat);

    // ✅ Fire alerts if critical
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
