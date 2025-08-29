import { Router } from "express";
import authController from "../controllers/auth.controller";
import { authGuard } from "../middlewares/auth.middleware";
import rateLimit from "express-rate-limit";

const router = Router();

// OTP talebi için basit rate limit (IP/e-posta spam koruması için yeterli)
const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/request-otp", otpLimiter, authController.requestOtp);
router.post("/verify-otp", authController.verifyOtp);

router.post("/login", authController.loginPassword);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

// Korunan yollar
router.get("/me", authGuard, authController.me);
router.post("/set-profile", authGuard, authController.setProfile);
router.post("/start-password-setup", authGuard, authController.startPasswordSetup);
router.post("/complete-password-setup", authController.completePasswordSetup);

export default router;