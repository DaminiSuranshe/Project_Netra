// ----------------------
// IMPORTS
// ----------------------
const express = require("express");
const axios = require("axios");
const router = express.Router();
const Threat = require("../models/Threat");

// Load API keys from environment
const { ABUSEIPDB_KEY, OTX_KEY, VT_KEY } = process.env;

// ----------------------
// CORRELATION ROUTE
// ----------------------
router.post("/", async (req, res) => {
  try {
    const { ioc } = req.body;
    if (!ioc) return res.status(400).json({ error: "IoC is required" });

    let enrichedThreat = {
      indicator: ioc,
      type: "ip", // default type, can be extended
      source: "Unknown",
      severity: "medium",
      description: "",
      message: "",
      details: "",
      geo: { country: "Unknown", region: "Unknown", city: "Unknown", latitude: 0, longitude: 0 },
      confidenceScore: 50,
      correlatedSources: [],
    };

    // -----------------------------
    // 1️⃣ AbuseIPDB (IP only)
    // -----------------------------
    try {
      const abuseRes = await axios.get("https://api.abuseipdb.com/api/v2/check", {
        headers: { Key: ABUSEIPDB_KEY, Accept: "application/json" },
        params: { ipAddress: ioc },
      });
      const data = abuseRes.data.data;
      enrichedThreat = {
        ...enrichedThreat,
        severity: data.abuseConfidenceScore > 50 ? "high" : "medium",
        source: "AbuseIPDB",
        description: `AbuseIPDB reports: ${data.abuseConfidenceScore}% abuse confidence`,
        message: `IP ${ioc} flagged by AbuseIPDB`,
        details: JSON.stringify(data),
        confidenceScore: data.abuseConfidenceScore,
        correlatedSources: [...enrichedThreat.correlatedSources, "AbuseIPDB"],
      };
    } catch (err) {
      console.error("AbuseIPDB error:", err.message);
    }

    // -----------------------------
    // 2️⃣ AlienVault OTX
    // -----------------------------
    try {
      const otxRes = await axios.get(`https://otx.alienvault.com/api/v1/indicators/IPv4/${ioc}/general`, {
        headers: { "X-OTX-API-KEY": OTX_KEY },
      });
      const pulseCount = otxRes.data.pulse_info?.count || 0;
      enrichedThreat.correlatedSources.push("AlienVault OTX");
      enrichedThreat.details += ` | OTX pulses: ${pulseCount}`;
    } catch (err) {
      console.error("OTX error:", err.message);
    }

    // -----------------------------
    // 3️⃣ VirusTotal
    // -----------------------------
    try {
      const vtRes = await axios.get(`https://www.virustotal.com/api/v3/ip_addresses/${ioc}`, {
        headers: { "x-apikey": VT_KEY },
      });
      enrichedThreat.details += ` | VT analysis: ${JSON.stringify(vtRes.data.data.attributes.last_analysis_stats)}`;
    } catch (err) {
      console.error("VirusTotal error:", err.message);
    }

    // -----------------------------
    // Save to MongoDB
    // -----------------------------
    const threat = await Threat.create(enrichedThreat);

    // ✅ Alerts (high/critical) are automatically triggered by ThreatSchema post-save hook
    res.json({ success: true, threat });

  } catch (error) {
    console.error("Correlation error:", error.message);
    res.status(500).json({ error: "Failed to correlate IoC" });
  }
});

module.exports = router;
