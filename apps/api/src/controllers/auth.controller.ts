import { Request, Response } from "express";
import {
  requestOtp,
  verifyOtpAndLogin,
  loginWithPassword,
  refreshTokens,
  logout,
  upgradeProfile,
  startPasswordSetup,
  completePasswordSetup,
  setPassword,
} from "../services/auth.service";



const authController = {
  requestOtp: async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "EMAIL_REQUIRED" });
    const resp = await requestOtp(email);
    return res.json(resp);
  },

  verifyOtp: async (req: Request, res: Response) => {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: "EMAIL_CODE_REQUIRED" });
    try {
      const r = await verifyOtpAndLogin({
        emailRaw: email,
        code,
        userAgent: req.headers["user-agent"],
        ip: req.ip,
      });
      return res.json(r);
    } catch (e) {
      return res.status(400).json({ error: "INVALID_OTP" });
    }
  },

  loginPassword: async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "EMAIL_PASSWORD_REQUIRED" });
    try {
      const r = await loginWithPassword({
        emailRaw: email,
        password,
        userAgent: req.headers["user-agent"],
        ip: req.ip,
      });
      return res.json(r);
    } catch {
      return res.status(400).json({ error: "INVALID_CREDENTIALS" });
    }
  },

  refresh: async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: "REFRESH_REQUIRED" });
    try {
      const r = await refreshTokens(refreshToken);
      return res.json(r);
    } catch {
      return res.status(400).json({ error: "INVALID_REFRESH" });
    }
  },

  logout: async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: "REFRESH_REQUIRED" });
    await logout(refreshToken);
    return res.json({ ok: true });
  },

  me: async (req: Request, res: Response) => {
    return res.json({ user: (req as any).user });
  },

  setProfile: async (req: Request, res: Response) => {
    const userId = (req as any).user?.id as string;
    const { name, avatar } = req.body;
    if (!name || !avatar) return res.status(400).json({ error: "NAME_AVATAR_REQUIRED" });
    try {
      const user = await upgradeProfile(userId, { name, avatar });
      return res.json({ user });
    } catch (e) {
      console.error("Set profile error:", e);
      return res.status(500).json({ error: "PROFILE_UPDATE_FAILED" });
    }
  },

  setPassword: async (req: Request, res: Response) => {
    const userId = (req as any).user?.id as string;
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "PASSWORD_TOO_SHORT" });
    }
    try {
      const user = await setPassword(userId, password);
      return res.json({ user });
    } catch (e) {
      console.error("Set password error:", e);
      return res.status(500).json({ error: "PASSWORD_UPDATE_FAILED" });
    }
  },

  

  startPasswordSetup: async (req: Request, res: Response) => {
    const userId = (req as any).user?.id as string;
    await startPasswordSetup(userId);
    return res.json({ ok: true });
  },

  completePasswordSetup: async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: "TOKEN_PASSWORD_REQUIRED" });
    await completePasswordSetup(token, newPassword);
    return res.json({ ok: true });
  },
};

export default authController;