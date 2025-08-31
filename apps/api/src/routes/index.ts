import { Router } from "express";
import healthController from "../controllers/health.controller";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";


const router = Router();

router.get("/health", healthController.check);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

export default router;