require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require("./routes/auth");
const applianceRoutes = require("./routes/appliances");
const billRoutes = require("./routes/bills");
const logRoutes = require("./routes/logs");
const aiRoutes = require("./routes/ai");

app.use("/api/auth", authRoutes);
app.use("/api/appliances", applianceRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
