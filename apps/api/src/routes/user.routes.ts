import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { userController } from "../controllers/user.controller";

const router = Router();

router.get("/me", authMiddleware, userController.getMe);

export default router;