import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Healthcheck
app.get("/api/v1/health", (_, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

export default app;