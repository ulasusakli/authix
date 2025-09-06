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
  changePassword
} from "../services/auth.service";
import { notifyEmail } from "../services/notification.service";
import { v4 as uuid } from "uuid";
import prisma from "../prisma";
import bcrypt from "bcrypt";



const authController = {
  // ---------------- OTP ----------------
  async requestOtp(req: Request, res: Response) {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "EMAIL_REQUIRED" });
    const resp = await requestOtp(email);
    return res.json(resp);
  },

  async verifyOtp(req: Request, res: Response) {
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
    } catch {
      return res.status(400).json({ error: "INVALID_OTP" });
    }
  },


  // ---------------- TOKEN REFRESH / LOGOUT ----------------
  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: "REFRESH_REQUIRED" });
    try {
      const r = await refreshTokens(refreshToken);
      return res.json(r);
    } catch {
      return res.status(400).json({ error: "INVALID_REFRESH" });
    }
  },

  async logout(req: Request, res: Response) {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: "REFRESH_REQUIRED" });
    await logout(refreshToken);
    return res.json({ ok: true });
  },

  // ---------------- USER ----------------
  async me(req: Request, res: Response) {
    return res.json({ user: (req as any).user });
  },

  async setProfile(req: Request, res: Response) {
    const userId = (req as any).user?.id as string;
    const { name, avatar } = req.body;
    if (!name || !avatar) return res.status(400).json({ error: "NAME_AVATAR_REQUIRED" });
    try {
      const user = await upgradeProfile(userId, { name, avatar });
      return res.json({ user });
    } catch (e) {
      console.error("[setProfile]", e);
      return res.status(500).json({ error: "PROFILE_UPDATE_FAILED" });
    }
  },

    // ---------------- PASSWORD MANAGEMENT ----------------

  async setPassword(req: Request, res: Response) {
    const userId = (req as any).user?.id as string;
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "PASSWORD_TOO_SHORT" });
    }
    try {
      const user = await setPassword(userId, password);
      return res.json({ user });
    } catch (e) {
      console.error("[setPassword]", e);
      return res.status(500).json({ error: "PASSWORD_UPDATE_FAILED" });
    }
  },

  async changePassword(req: Request, res: Response) {
    const userId = (req as any).user?.id as string;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "VALIDATION_ERROR" });
    }

    try {
      const result = await changePassword(userId, oldPassword, newPassword);
      if ((result as any).error === "INVALID_OLD_PASSWORD") {
        return res.status(400).json({ error: "INVALID_OLD_PASSWORD" });
      }
      return res.json({ message: "PASSWORD_CHANGED" });
    } catch (e) {
      console.error("[changePassword]", e);
      return res.status(500).json({ error: "FAILED_TO_CHANGE_PASSWORD" });
    }
  },


  async requestPasswordReset(req: Request, res: Response) {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "EMAIL_REQUIRED" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.id) {
      // güvenlik için 200 dön ama işlem yapma
      return res.json({ success: true });
    }

    const token = uuid();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 saat geçerli

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    await notifyEmail("passwordReset", email, { token });

    return res.json({ success: true });
  },

  async resetPassword(req: Request, res: Response) {
  const { token, password } = req.body;
  if (!token || !password)
    return res.status(400).json({ error: "TOKEN_PASSWORD_REQUIRED" });

  const prt = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!prt || prt.used || prt.expiresAt < new Date()) {
    return res.status(400).json({ error: "INVALID_OR_EXPIRED_TOKEN" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: prt.userId },
    data: {
      password: hashedPassword,
    },
  });

  await prisma.passwordResetToken.update({
    where: { id: prt.id },
    data: { used: true },
  });

  return res.json({ success: true });
}

};

export default authController;