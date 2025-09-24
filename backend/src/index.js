const express = require("express");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
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
