const express = require("express");
const router = express.Router();
const axios = require("axios");

// Load API keys
const { ABUSEIPDB_KEY, OTX_KEY, VT_KEY } = process.env;

/**
 * POST /api/ioc/lookup
 * Body: { type: "ip"|"domain"|"hash", value: "1.2.3.4" }
 * Returns consolidated results from multiple threat intel sources
 */
router.post("/lookup", async (req, res) => {
  const { type, value } = req.body;
  if (!type || !value) return res.status(400).json({ error: "All fields are required" });

  try {
    const results = [];

    // -----------------------------
    // 1️⃣ AbuseIPDB (only IP supported)
    // -----------------------------
    if (type === "ip") {
      try {
        const abuseRes = await axios.get("https://api.abuseipdb.com/api/v2/check", {
          headers: { Key: ABUSEIPDB_KEY, Accept: "application/json" },
          params: { ipAddress: value },
        });
        const data = abuseRes.data.data;
        results.push({
          source: "AbuseIPDB",
          type: "IP",
          indicator: value,
          reputation: data.isPublic ? "Malicious" : "Unknown",
          confidence: data.abuseConfidenceScore,
        });
      } catch (err) {
        console.error("AbuseIPDB error:", err.message);
      }
    }

    // -----------------------------
    // 2️⃣ AlienVault OTX
    // -----------------------------
    try {
      const otxRes = await axios.get(`https://otx.alienvault.com/api/v1/indicators/${type}/${value}/general`, {
        headers: { "X-OTX-API-KEY": OTX_KEY },
      });
      results.push({
        source: "AlienVault OTX",
        type: otxRes.data.type,
        indicator: otxRes.data.indicator,
        pulseCount: otxRes.data.pulse_info?.count || 0,
      });
    } catch (err) {
      console.error("OTX error:", err.message);
    }

    // -----------------------------
    // 3️⃣ VirusTotal
    // -----------------------------
    try {
      let url = "";
      if (type === "ip") url = `https://www.virustotal.com/api/v3/ip_addresses/${value}`;
      else if (type === "domain") url = `https://www.virustotal.com/api/v3/domains/${value}`;
      else if (type === "hash") url = `https://www.virustotal.com/api/v3/files/${value}`;

      const vtRes = await axios.get(url, { headers: { "x-apikey": VT_KEY } });
      results.push({
        source: "VirusTotal",
        type,
        indicator: value,
        lastAnalysisStats: vtRes.data.data.attributes.last_analysis_stats,
      });
    } catch (err) {
      console.error("VirusTotal error:", err.message);
    }

    res.json({ results });

  } catch (error) {
    console.error("IoC Lookup error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
