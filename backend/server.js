import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./src/config/db.js";
import authRoutes from "./src/modules/auth/auth.routes.js";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Database Connection
connectDB();

// Routes
app.use("/api/auth", authRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});