const express = require("express");
const router = express.Router();
const axios = require("axios");
const xml2js = require("xml2js");
const Threat = require("../models/Threat");

// Load API keys
const { ABUSEIPDB_KEY, OTX_KEY, VT_KEY } = process.env;

// -----------------------------
// FETCH THREAT FEEDS
// -----------------------------
router.get("/fetch", async (req, res) => {
  try {
    const threats = [];

    // -----------------------------
    // 1️⃣ AbuseIPDB - top 10 malicious IPs
    // -----------------------------
    const abuseRes = await axios.get(
      "https://api.abuseipdb.com/api/v2/blacklist",
      {
        headers: { Key: ABUSEIPDB_KEY, Accept: "application/json" },
        params: { limit: 10 }
      }
    );

    abuseRes.data.data.forEach(ip => {
      threats.push({
        source: "AbuseIPDB",
        type: "IP",
        indicator: ip.ipAddress,
        description: ip.description,
        severity: ip.abuseConfidenceScore > 50 ? "High" : "Medium",
        date: new Date()
      });
    });

    // -----------------------------
    // 2️⃣ AlienVault OTX - top 10 pulses
    // -----------------------------
    const otxRes = await axios.get(
      "https://otx.alienvault.com/api/v1/pulses/subscribed",
      { headers: { "X-OTX-API-KEY": OTX_KEY } }
    );

    otxRes.data.pulses.slice(0, 10).forEach(pulse => {
      pulse.indicators.slice(0, 5).forEach(indicator => {
        threats.push({
          source: "OTX",
          type: indicator.type,
          indicator: indicator.indicator,
          description: pulse.name,
          severity: "Medium",
          date: new Date(pulse.created)
        });
      });
    });

    // -----------------------------
    // 3️⃣ VirusTotal - sample IP report
    // -----------------------------
    const vtRes = await axios.get(
      "https://www.virustotal.com/api/v3/ip_addresses/8.8.8.8", // example IP
      { headers: { "x-apikey": VT_KEY } }
    );

    threats.push({
      source: "VirusTotal",
      type: "IP",
      indicator: vtRes.data.data.id,
      description: "VirusTotal analysis",
      severity: "Medium",
      date: new Date()
    });

    // -----------------------------
    // 4️⃣ CISA RSS Feed
    // -----------------------------
    const cisaRes = await axios.get("https://www.cisa.gov/uscert/ncas/alerts.xml");
    const parsed = await xml2js.parseStringPromise(cisaRes.data);
    parsed.rss.channel[0].item.slice(0, 5).forEach(item => {
      threats.push({
        source: "CISA",
        type: "Advisory",
        indicator: item.title[0],
        description: item.description[0],
        severity: "High",
        date: new Date(item.pubDate[0])
      });
    });

    // -----------------------------
    // Save to MongoDB
    // -----------------------------
    await Threat.insertMany(threats);

    res.json({ message: "Threat feeds fetched and stored", count: threats.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
