require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const authRoutes = require("./routes/authRoutes");
const seatRoutes = require("./routes/seatRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
    res.send("Train Booking API is live 🚂");
  });

app.use("/api/auth", authRoutes);
app.use("/api/seats", seatRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
