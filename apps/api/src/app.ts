import express from "express";
import cors from "cors";
import helmet from "helmet";
import logger from "./config/logger";
import routes from "./routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(logger);

// ✅ Health route en üstte olmalı
app.get("/api/v1/health", (_, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// ❗ Diğer API route'ları bundan sonra
app.use("/api/v1", routes);

export default app;