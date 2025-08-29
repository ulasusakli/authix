import { Router } from "express";
import healthController from "../controllers/health.controller";
import authRoutes from "./auth.routes";

const router = Router();

router.get("/health", healthController.check);
router.use("/auth", authRoutes);

export default router;