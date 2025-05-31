// ==== Import packages ====
require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// ==== Config ====
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ==== Connect to MongoDB ====
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// ==== Import & use routes ====
const pollRoutes = require("./routes/polls");
app.use("/api/polls", pollRoutes);

// ==== Start server ====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
