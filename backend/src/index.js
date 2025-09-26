// ----------------------
// IMPORTS
// ----------------------
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");

const connectDB = require("./config/db");

// Models
const Threat = require("./models/Threat");

// Routes
const threatRoutes = require("./routes/threats");
const iocRoutes = require("./routes/ioc");
const correlateRoutes = require("./routes/correlate");
const healthRoute = require("./routes/health");
const authRoutes = require("./routes/auth");
const protectedRoute = require("./routes/protected");
const dashboardRoutes = require("./routes/dashboard");

// Middleware
const authMiddleware = require("./middlewares/authMiddleware");

// Alerts
const { scheduleDailyReports, sendCriticalAlert } = require("./utils/alertUtils");

// ----------------------
// CONFIGURATION
// ----------------------
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// ----------------------
// ROUTES
// ----------------------
app.use("/api/threats", threatRoutes);
app.use("/api/ioc", iocRoutes);
app.use("/api/correlate", correlateRoutes);
app.use("/api/health", healthRoute);
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoute);
app.use("/api/dashboard", authMiddleware, dashboardRoutes);

// ----------------------
// TEMP TEST ROUTE
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
// DATABASE CONNECTION & SERVER START
// ----------------------
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
  })
  .catch(err => console.error("MongoDB connection failed:", err));

// ----------------------
// SCHEDULE DAILY REPORTS
// ----------------------
scheduleDailyReports();

// ----------------------
// OPTIONAL: MANUAL ALERT
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

// testManualAlert(); // Uncomment to test once
