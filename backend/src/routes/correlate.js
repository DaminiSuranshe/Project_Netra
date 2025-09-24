const express = require("express");
const router = express.Router();

// POST /api/correlate/enrich
router.post("/enrich", (req, res) => {
  const { iocs } = req.body;
  if (!iocs || !Array.isArray(iocs)) {
    return res.status(400).json({ error: "iocs must be an array" });
  }

  // fake enrichment for testing
  const results = iocs.map(ioc => ({
    ioc,
    type: isNaN(Number(ioc[0])) ? "Domain/Hash" : "IP",
    confidence: Math.floor(Math.random() * 100),
    source: "TestSource"
  }));

  res.json({ results });
});

module.exports = router;
