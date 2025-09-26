// src/index.js

// ----------------------
// IMPORTS
// ----------------------
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const Threat = require("./models/Threat");

// Routes
const threatRoutes = require("./routes/threats");
const iocRoutes = require("./routes/ioc");
const correlateRoutes = require("./routes/correlate");
const healthRoute = require("./routes/health");
const authRoutes = require("./routes/auth");
const protectedRoute = require("./routes/protected");

// Alerts
const { scheduleDailyReports, sendCriticalAlert } = require("./utils/alertUtils");

// ----------------------
// CONFIGURATION
// ----------------------
dotenv.config();
const app = express();

// ----------------------
// MIDDLEWARE
// ----------------------
app.use(cors());
app.use(express.json());

// ----------------------
// ROUTES
// ----------------------
app.use("/api/ioc", iocRoutes);
app.use("/api/threats", threatRoutes);       // Phase 3 + 4 threat fetch & storage
app.use("/api/correlate", correlateRoutes); // Phase 6 enrichment
app.use("/api/health", healthRoute);
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoute);

// ----------------------
// DATABASE CONNECTION
// ----------------------
connectDB();

// ----------------------
// SCHEDULE DAILY REPORTS (8 AM every day)
// ----------------------
scheduleDailyReports();

// ----------------------
// TEMP TEST ROUTE (Insert & Retrieve Threats)
// ----------------------
app.get("/api/testdb", async (req, res) => {
  try {
    const threat = await Threat.create({
      name: "Malware XYZ",
      severity: "high",
      indicator: "192.168.1.100",
      message: "Test alert",
      details: "This is a test threat for alert system"
    });

    const threats = await Threat.find();
    res.json({ inserted: threat, allThreats: threats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------
// EXAMPLE MANUAL ALERT (OPTIONAL)
// ----------------------
async function testManualAlert() {
  const threat = {
    severity: "high",
    indicator: "10.0.0.5",
    source: "Manual Test",
    message: "Manual SQL Injection Attempt",
    details: "Detected suspicious payload in login parameter"
  };

  await sendCriticalAlert(threat);
}

// Uncomment to test manual alert once
// testManualAlert();

// ----------------------
// START SERVER
// ----------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
