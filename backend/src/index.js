const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const Threat = require("./models/Threat");

app.get("/api/testdb", async (req, res) => {
  try {
    // Insert sample data
    const threat = await Threat.create({ name: "Malware XYZ", severity: "High" });
    // Retrieve all threats
    const threats = await Threat.find();
    res.json({ inserted: threat, allThreats: threats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
const healthRoute = require("./routes/health");
app.use("/api/health", healthRoute);

// Default route
app.get("/", (req, res) => {
  res.send("🚀 Cyber Threat Intelligence API is running...");
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
