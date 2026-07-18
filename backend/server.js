const express = require("express");
const cors = require("cors");
require("dotenv").config();

require("./database/database"); // creates unified secureauth.db + tables

const authRoutes = require("./routes/authRoutes");
const riskRoutes = require("./routes/riskRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/risk", riskRoutes);

app.get("/", (req, res) => {
    res.send("🚀 SecureAuth Backend is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
