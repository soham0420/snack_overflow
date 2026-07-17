const authRoutes = require("./routes/authRoutes");
const express = require("express");
const cors = require("cors");
require("dotenv").config();


const riskRoutes = require("./routes/riskRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});

app.use("/api/auth", authRoutes);
app.use("/api/risk", riskRoutes);

require("./database/database");

app.get("/", (req, res) => {
  res.send("THIS IS MY EXPRESS SERVER");
});

app.use("/api/security", riskRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});