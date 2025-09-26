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
const { sendCriticalAlert, scheduleDailyReports } = require("./utils/alertUtils");

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
app.use("/api/threats", threatRoutes);
app.use("/api/correlate", correlateRoutes);
app.use("/api/health", healthRoute);
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoute);

// ----------------------
// DATABASE CONNECTION
// ----------------------
connectDB();

// ----------------------
// TEMP TEST ROUTE
// ----------------------
app.get("/api/testdb", async (req, res) => {
  try {
    const threat = await Threat.create({ name: "Malware XYZ", severity: "High" });
    const threats = await Threat.find();
    res.json({ inserted: threat, allThreats: threats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------
// START ALERTS
// ----------------------
scheduleDailyReports(); // Start daily report scheduler

// Example threat alert (optional test)
const testThreat = {
  severity: 'high',
  message: 'SQL Injection attempt detected',
  details: 'UserID param exploited'
};
sendCriticalAlert(testThreat);

// ----------------------
// START SERVER
// ----------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
