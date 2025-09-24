const express = require("express");
const router = express.Router();
const axios = require("axios");
const Threat = require("../models/Threat");

const { IPAPI_KEY } = process.env;

// -----------------------------
// GET /api/threats/enrich
// Enrich threats with GeoIP and correlation
// -----------------------------
router.get("/enrich", async (req, res) => {
  try {
    const threats = await Threat.find({});
    const enriched = [];

    for (let t of threats) {
      // GeoIP enrichment for IPs only
      if (t.type.toLowerCase() === "ip") {
        try {
          const geoRes = await axios.get(`https://ipapi.co/${t.indicator}/json/`);
          t.geo = {
            country: geoRes.data.country_name || "",
            region: geoRes.data.region || "",
            city: geoRes.data.city || "",
            latitude: geoRes.data.latitude || null,
            longitude: geoRes.data.longitude || null,
          };
        } catch (err) {
          console.error(`GeoIP failed for ${t.indicator}:`, err.message);
        }
      }

      // Threat correlation: check if same indicator appears in other sources
      const correlatedSources = threats
        .filter(x => x.indicator === t.indicator && x.source !== t.source)
        .map(x => x.source);

      t.correlatedSources = [...new Set(correlatedSources)];

      // Confidence score calculation (simple example)
      let score = 50; // base
      if (t.severity.toLowerCase() === "high") score += 30;
      score += t.correlatedSources.length * 10;
      t.confidenceScore = Math.min(score, 100);

      await t.save();
      enriched.push(t);
    }

    res.json({ message: "✅ Threats enriched and correlated", count: enriched.length, data: enriched });
  } catch (err) {
    console.error("❌ Enrichment Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
