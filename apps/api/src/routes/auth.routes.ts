import { Router } from "express";
import authController from "../controllers/auth.controller";
import { authMiddleware} from "../middlewares/auth.middleware";
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

router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

// Korunan yollar
router.get("/me", authMiddleware, authController.me);
router.post("/set-profile", authMiddleware, authController.setProfile);


// Set Profile and Password
router.post("/set-profile", authMiddleware, authController.setProfile);
router.post("/set-password", authMiddleware, authController.setPassword);

// Password change
router.patch("/change-password", authMiddleware, authController.changePassword);


// Password reset
router.post("/request-password-reset", authController.requestPasswordReset);
router.post("/reset-password", authController.resetPassword);


export default router;