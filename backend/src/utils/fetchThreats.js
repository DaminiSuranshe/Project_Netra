// backend/src/utils/fetchThreats.js

const axios = require("axios");

// ----------------------
// FETCH THREAT DATA
// ----------------------
async function fetchThreatData(indicator) {
  const results = [];

  // ----- AbuseIPDB -----
  try {
    const abuseRes = await axios.get(`https://api.abuseipdb.com/api/v2/check`, {
      params: { ipAddress: indicator, maxAgeInDays: 90 },
      headers: { "Key": process.env.ABUSEIPDB_API_KEY, "Accept": "application/json" },
    });

    const abuseData = abuseRes.data?.data;
    if (abuseData) {
      results.push({
        source: "AbuseIPDB",
        indicator: abuseData.ipAddress,
        type: "IP",
        severity: abuseData.abuseConfidenceScore >= 80 ? "high" : abuseData.abuseConfidenceScore >= 50 ? "medium" : "low",
        confidenceScore: abuseData.abuseConfidenceScore,
        lastAnalysisStats: abuseData,
      });
    }
  } catch (err) {
    results.push({ source: "AbuseIPDB", error: err.message });
    console.error("❌ AbuseIPDB Error:", err.response?.data || err.message);
  }

  // ----- OTX AlienVault -----
  try {
    const otxRes = await axios.get(`https://otx.alienvault.com/api/v1/indicators/${encodeURIComponent(indicator)}/general`, {
      headers: { "X-OTX-API-KEY": process.env.OTX_API_KEY },
    });

    const otxData = otxRes.data;
    if (otxData) {
      results.push({
        source: "OTX",
        indicator,
        type: otxData.type || "unknown",
        severity: "medium", // OTX doesn’t provide severity, default to medium
        pulseCount: otxData.pulse_info?.count || 0,
        lastAnalysisStats: otxData,
      });
    }
  } catch (err) {
    results.push({ source: "OTX", error: err.message });
    console.error("❌ OTX Error:", err.response?.data || err.message);
  }

  // ----- VirusTotal -----
  try {
    const vtRes = await axios.get(`https://www.virustotal.com/api/v3/ip_addresses/${indicator}`, {
      headers: { "x-apikey": process.env.VT_API_KEY },
    });

    const vtData = vtRes.data;
    if (vtData) {
      const lastAnalysis = vtData.data?.attributes?.last_analysis_stats || {};
      results.push({
        source: "VirusTotal",
        indicator,
        type: "IP",
        severity: lastAnalysis.malicious >= 5 ? "high" : lastAnalysis.suspicious >= 3 ? "medium" : "low",
        lastAnalysisStats: lastAnalysis,
      });
    }
  } catch (err) {
    results.push({ source: "VirusTotal", error: err.message });
    console.error("❌ VirusTotal Error:", err.response?.data || err.message);
  }

  return results;
}

module.exports = { fetchThreatData };
