const express = require("express");
const router = express.Router();
const axios = require("axios");
const xml2js = require("xml2js");
const Threat = require("../models/Threat");
const { Parser } = require("json2csv"); 
const ExcelJS = require("exceljs"); 

// Load API keys from .env
const { ABUSEIPDB_KEY, OTX_KEY, VT_KEY } = process.env;

/**
 * GET /api/threats
 * Returns all stored threats
 * Protected route (requires JWT)
 */
router.get("/", async (req, res) => {
  try {
    const threats = await Threat.find().sort({ date: -1 }).limit(50); // latest 50
    res.json(threats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/threats/fetch
 * Fetches latest threats from AbuseIPDB, AlienVault OTX, VirusTotal, and CISA RSS
 */
router.get("/fetch", async (req, res) => {
  try {
    const threats = [];

    // -----------------------------
    // 1️⃣ AbuseIPDB (Top Malicious IPs)
    // -----------------------------
    try {
      const abuseRes = await axios.get(
        "https://api.abuseipdb.com/api/v2/blacklist",
        {
          headers: { Key: ABUSEIPDB_KEY, Accept: "application/json" },
          params: { limit: 10 },
        }
      );

      if (Array.isArray(abuseRes.data?.data)) {
        abuseRes.data.data.forEach((ip) => {
          threats.push({
            source: "AbuseIPDB",
            type: "IP",
            indicator: ip.ipAddress,
            description: ip.countryCode || "Reported malicious IP",
            severity: ip.abuseConfidenceScore > 50 ? "High" : "Medium",
            date: new Date(),
          });
        });
      }
    } catch (err) {
      console.error("❌ AbuseIPDB Error:", err.response?.data || err.message);
    }

    // -----------------------------
    // 2️⃣ AlienVault OTX (Subscribed Pulses → fallback to Public)
    // -----------------------------
    try {
      const otxRes = await axios.get(
        "https://otx.alienvault.com/api/v1/pulses/subscribed",
        { headers: { "X-OTX-API-KEY": OTX_KEY } }
      );

      let pulses = [];
      if (Array.isArray(otxRes.data?.pulses)) {
        pulses = otxRes.data.pulses.slice(0, 5);
      } else if (Array.isArray(otxRes.data?.results)) {
        pulses = otxRes.data.results.slice(0, 5);
      }

      (pulses || []).forEach((pulse) => {
        if (Array.isArray(pulse.indicators)) {
          pulse.indicators.slice(0, 5).forEach((indicator) => {
            threats.push({
              source: "AlienVault OTX",
              type: indicator.type,
              indicator: indicator.indicator,
              description: pulse.name || "OTX Pulse",
              severity: "Medium",
              date: new Date(pulse.created || Date.now()),
            });
          });
        }
      });
    } catch (err) {
      console.error("❌ OTX Error:", err.response?.data || err.message);
    }

    // -----------------------------
    // 3️⃣ VirusTotal (Example IP lookup)
    // -----------------------------
    try {
      const vtRes = await axios.get(
        "https://www.virustotal.com/api/v3/ip_addresses/8.8.8.8",
        { headers: { "x-apikey": VT_KEY } }
      );

      if (vtRes.data?.data?.id) {
        threats.push({
          source: "VirusTotal",
          type: "IP",
          indicator: vtRes.data.data.id,
          description: "VirusTotal analysis for 8.8.8.8",
          severity: "Medium",
          date: new Date(),
        });
      }
    } catch (err) {
      console.error("❌ VirusTotal Error:", err.response?.data || err.message);
    }

    // -----------------------------
    // 4️⃣ CISA RSS Feed
    // -----------------------------
    try {
      const cisaRes = await axios.get(
        "https://www.cisa.gov/uscert/ncas/alerts.xml"
      );
      const parsed = await xml2js.parseStringPromise(cisaRes.data);

      const items = parsed?.rss?.channel?.[0]?.item || [];
      items.slice(0, 5).forEach((item) => {
        threats.push({
          source: "CISA",
          type: "Advisory",
          indicator: item.title?.[0] || "No title",
          description: item.description?.[0] || "No description",
          severity: "High",
          date: new Date(item.pubDate?.[0] || Date.now()),
        });
      });
    } catch (err) {
      console.error("❌ CISA Error:", err.response?.data || err.message);
    }

    // -----------------------------
    // Save to MongoDB
    // -----------------------------
    if (threats.length > 0) {
      await Threat.insertMany(threats);
    }

    res.json({
      message: "✅ Threat feeds fetched and stored",
      count: threats.length,
    });
  } catch (error) {
    console.error("❌ Threat Fetch Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Search and filter threats with pagination
router.get("/search", async (req, res) => {
  try {
    const { query, severity, source, startDate, endDate, page = 1, limit = 10 } = req.query;

    let filter = {};

    // Search by IOC (IP, domain, hash, name)
    if (query) {
      filter.$or = [
        { ip: { $regex: query, $options: "i" } },
        { domain: { $regex: query, $options: "i" } },
        { hash: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } }
      ];
    }

    if (severity) filter.severity = severity;
    if (source) filter.source = source;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const threats = await Threat.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Threat.countDocuments(filter);

    res.json({
      threats,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Export threats as CSV
router.get("/export", async (req, res) => {
  try {
    const { query, severity, source, startDate, endDate } = req.query;

    let filter = {};

    if (query) {
      filter.$or = [
        { ip: { $regex: query, $options: "i" } },
        { domain: { $regex: query, $options: "i" } },
        { hash: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } }
      ];
    }
    if (severity) filter.severity = severity;
    if (source) filter.source = source;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const threats = await Threat.find(filter).sort({ createdAt: -1 });

    if (!threats.length) {
      return res.status(404).json({ error: "No threats found to export" });
    }

    const fields = ["name", "ip", "domain", "hash", "severity", "source", "createdAt"];
    const parser = new Parser({ fields });
    const csv = parser.parse(threats);

    res.header("Content-Type", "text/csv");
    res.attachment("threats_export.csv");
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Export threats as Excel
router.get("/export/excel", async (req, res) => {
  try {
    const { query, severity, source, startDate, endDate } = req.query;

    let filter = {};

    if (query) {
      filter.$or = [
        { ip: { $regex: query, $options: "i" } },
        { domain: { $regex: query, $options: "i" } },
        { hash: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } }
      ];
    }
    if (severity) filter.severity = severity;
    if (source) filter.source = source;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const threats = await Threat.find(filter).sort({ createdAt: -1 });

    if (!threats.length) {
      return res.status(404).json({ error: "No threats found to export" });
    }

    // Create workbook & sheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Threats");

    // Define columns
    worksheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "IP", key: "ip", width: 20 },
      { header: "Domain", key: "domain", width: 25 },
      { header: "Hash", key: "hash", width: 40 },
      { header: "Severity", key: "severity", width: 15 },
      { header: "Source", key: "source", width: 20 },
      { header: "Created At", key: "createdAt", width: 25 }
    ];

    // Add rows
    threats.forEach(t => worksheet.addRow(t.toObject()));

    // Format header row
    worksheet.getRow(1).font = { bold: true };

    // Send file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=threats_export.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------
// GET /api/threats/latest
// Returns latest threats for dashboard (limit 50 by default)
// ----------------------
router.get("/latest", async (req, res) => {
  try {
    // Optional: allow query param to limit results
    const limit = parseInt(req.query.limit) || 50;

    const threats = await Threat.find()
      .sort({ date: -1 })       // newest first
      .limit(limit)
      .select("source type indicator severity message geo confidenceScore pulseCount"); // only needed fields

    res.json({ results: threats });
  } catch (err) {
    console.error("❌ Failed to fetch latest threats:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;