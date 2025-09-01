import { PrismaClient } from "@prisma/client";
import env from "../config/env";
import { generateNumericCode, randomUsername } from "../utils/crypto";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { hashPassword, comparePassword } from "../utils/hash";
import { sendOtpEmail, sendPasswordResetEmail } from "./email.service";
import crypto from "crypto";

const prisma = new PrismaClient();

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

// ---------------- OTP FLOW ----------------

export async function requestOtp(emailRaw: string) {
  const email = normalizeEmail(emailRaw);
  const code = generateNumericCode(env.OTP_CODE_LENGTH);
  const expires = new Date(Date.now() + env.OTP_TTL_MINUTES * 60_000);

  const last = await prisma.otpToken.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });
  if (last && Date.now() - last.createdAt.getTime() < 60_000) {
    return { ok: true, throttled: true };
  }

  await prisma.otpToken.create({
    data: { email, code, expiresAt: expires },
  });

  await sendOtpEmail(email, code);
  return { ok: true };
}

async function consumeOtp(email: string, code: string) {
  const token = await prisma.otpToken.findFirst({
    where: { email, code, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!token) return false;
  await prisma.otpToken.update({ where: { id: token.id }, data: { used: true } });
  return true;
}

export async function verifyOtpAndLogin(params: {
  emailRaw: string;
  code: string;
  userAgent?: string;
  ip?: string;
}) {
  const email = normalizeEmail(params.emailRaw);
  const ok = await consumeOtp(email, params.code);
  if (!ok) throw new Error("INVALID_OTP");

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        username: randomUsername(),
        level: 0,
        isVerified: true,
      },
    });
  }

  const access = signAccessToken({ sub: user.id, level: user.level });
  const refresh = signRefreshToken({ sub: user.id, level: user.level });
  const refreshExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken: refresh,
      userAgent: params.userAgent,
      ipAddress: params.ip,
      expiresAt: refreshExp,
    },
  });

  return { user, accessToken: access, refreshToken: refresh };
}

// ---------------- PASSWORD LOGIN ----------------

export async function loginWithPassword(params: {
  emailRaw: string;
  password: string;
  userAgent?: string;
  ip?: string;
}) {
  const email = normalizeEmail(params.emailRaw);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) throw new Error("INVALID_CREDENTIALS");

  const match = await comparePassword(params.password, user.password);
  if (!match) throw new Error("INVALID_CREDENTIALS");

  const access = signAccessToken({ sub: user.id, level: user.level });
  const refresh = signRefreshToken({ sub: user.id, level: user.level });
  const refreshExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken: refresh,
      userAgent: params.userAgent,
      ipAddress: params.ip,
      expiresAt: refreshExp,
    },
  });

  return { user, accessToken: access, refreshToken: refresh };
}

// ---------------- TOKEN REFRESH / LOGOUT ----------------

export async function refreshTokens(refreshToken: string) {
  const session = await prisma.session.findUnique({ where: { refreshToken } });
  if (!session || session.expiresAt < new Date()) throw new Error("INVALID_REFRESH");

  const payload = verifyRefreshToken(refreshToken);
  const userId = payload.sub as string;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("INVALID_REFRESH");

  const access = signAccessToken({ sub: user.id, level: user.level });
  const newRefresh = signRefreshToken({ sub: user.id, level: user.level });
  const refreshExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.session.delete({ where: { refreshToken } }),
    prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: newRefresh,
        expiresAt: refreshExp,
      },
    }),
  ]);

  return { user, accessToken: access, refreshToken: newRefresh };
}

export async function logout(refreshToken: string) {
  await prisma.session.delete({ where: { refreshToken } }).catch(() => {});
  return { ok: true };
}

// ---------------- PROFILE / PASSWORD SETUP ----------------

export async function upgradeProfile(userId: string, data: { name: string; avatar: string }) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: data.name, avatar: data.avatar, level: { set: 1 } },
  });
  return user;
}

export async function startPasswordSetup(userId: string) {
  const token = crypto.randomBytes(20).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.passwordResetToken.create({
    data: { userId, token, expiresAt: expires },
  });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) await sendPasswordResetEmail(user.email, token);
  return { ok: true };
}

export async function completePasswordSetup(token: string, newPassword: string) {
  const item = await prisma.passwordResetToken.findFirst({
    where: { token, used: false, expiresAt: { gt: new Date() } },
  });
  if (!item) throw new Error("INVALID_TOKEN");

  const hash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: item.userId },
      data: { password: hash, level: { set: 2 } },
    }),
    prisma.passwordResetToken.update({
      where: { id: item.id },
      data: { used: true },
    }),
  ]);
  return { ok: true };
}

export async function setPassword(userId: string, password: string) {
  const hash = await hashPassword(password);
  const user = await prisma.user.update({
    where: { id: userId },
    data: { password: hash, level: { set: 2 } },
  });
  return user;
}

export async function changePassword(userId: string, oldPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.password) {
    return { error: "INVALID_OLD_PASSWORD" };
  }

  const valid = await comparePassword(oldPassword, user.password);
  if (!valid) {
    return { error: "INVALID_OLD_PASSWORD" };
  }

  const hash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hash },
  });

  return { success: true };
}