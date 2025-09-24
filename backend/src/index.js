// ----------------------
// IMPORTS
// ----------------------
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Routes
const threatRoutes = require("./routes/threats");
const correlateRoutes = require("./routes/correlate"); // Phase 6
const iocRoutes = require("./routes/ioc");
const authRoutes = require("./routes/auth");
const healthRoute = require("./routes/health");

// Middleware
const authMiddleware = require("./middleware/authMiddleware");

// ----------------------
// CONFIGURATION
// ----------------------
dotenv.config();
const app = express(); // Must be initialized first

// ----------------------
// MIDDLEWARE
// ----------------------
app.use(cors());
app.use(express.json());

// ----------------------
// DATABASE CONNECTION
// ----------------------
connectDB();

// ----------------------
// ROUTES
// ----------------------
app.use("/api/health", healthRoute);
app.use("/api/auth", authRoutes);

// Protected threat fetch route
app.use("/api/threats", authMiddleware, threatRoutes);

// Correlation routes
app.use("/api/threats", correlateRoutes);

// IOC routes
app.use("/api/ioc", iocRoutes);

// ----------------------
// TEMP TEST ROUTE
// ----------------------
const Threat = require("./models/Threat");

app.get("/api/testdb", async (req, res) => {
  try {
    // Insert sample threat
    const threat = await Threat.create({ name: "Malware XYZ", severity: "High" });

    // Retrieve all threats
    const threats = await Threat.find();

    res.json({ inserted: threat, allThreats: threats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------
// START SERVER
// ----------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
