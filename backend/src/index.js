// src/index.js

// ----------------------
// IMPORTS
// ----------------------
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const Threat = require("./models/Threat");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

// Routes
const threatRoutes = require("./routes/threats");
const iocRoutes = require("./routes/ioc");
const correlateRoutes = require("./routes/correlate");
const healthRoute = require("./routes/health");
const authRoutes = require("./routes/auth");
const protectedRoute = require("./routes/protected");
const dashboardRoutes = require("./routes/dashboard");
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const { authMiddleware } = require('./middleware/authMiddleware');

const app = express();
app.use(bodyParser.json());

// Alerts
const { scheduleDailyReports, sendCriticalAlert } = require("./utils/alertUtils");

// ----------------------
// CONFIGURATION
// ----------------------
dotenv.config();

// ----------------------
// MIDDLEWARE
// ----------------------
app.use(cors());
app.use(express.json());
app.use("/api/threats", threatRoutes);

// ----------------------
// ROUTES
// ----------------------
app.use("/api/ioc", iocRoutes);
app.use("/api/threats", threatRoutes);       // Phase 3 + 4 threat fetch & storage
app.use("/api/correlate", correlateRoutes); // Phase 6 enrichment
app.use("/api/health", healthRoute);
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoute);
app.use("/api/dashboard", dashboardRoutes);
app.use('/auth', authRoutes);
app.use('/dashboard', authMiddleware, dashboardRoutes);

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

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error(err));

app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));

