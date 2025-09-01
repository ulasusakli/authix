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

router.post("/login", authController.loginPassword);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

// Korunan yollar
router.get("/me", authMiddleware, authController.me);
router.post("/set-profile", authMiddleware, authController.setProfile);
router.post("/start-password-setup", authMiddleware, authController.startPasswordSetup);
router.post("/complete-password-setup", authController.completePasswordSetup);


router.post("/set-profile", authMiddleware, authController.setProfile);
router.post("/set-password", authMiddleware, authController.setPassword);

router.patch("/change-password", authMiddleware, authController.changePassword);


export default router;