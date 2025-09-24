// ----------------------
// IMPORTS
// ----------------------
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const Threat = require("./models/Threat");

// ----------------------
// CONFIGURATION
// ----------------------
dotenv.config();
const app = express(); // Must be initialized BEFORE using app.use/app.get

// ----------------------
// MIDDLEWARE
// ----------------------
app.use(cors()); // Allow frontend to fetch backend
app.use(express.json()); // Parse JSON bodies

// ----------------------
// DATABASE CONNECTION
// ----------------------
connectDB();

// ----------------------
// ROUTES
// ----------------------

// Health check route
const healthRoute = require("./routes/health");
app.use("/api/health", healthRoute);

// Auth routes
const authRoute = require("./routes/auth");
app.use("/api/auth", authRoute);

// Protected route
const protectedRoute = require("./routes/protected");
app.use("/api/protected", protectedRoute);

// Threat routes
const threatRoute = require("./routes/threats");
app.use("/api/threats", threatRoute);

// Temporary test route: Insert & Retrieve threats
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
