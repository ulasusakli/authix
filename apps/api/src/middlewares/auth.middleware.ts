// apps/api/src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

function isLikelyJwt(token: unknown): token is string {
  return (
    typeof token === "string" &&
    /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/.test(token)
  );
}

function readCookie(req: Request, name: string): string | null {
  const header = req.headers.cookie || "";
  for (const pair of header.split(";")) {
    const [k, v] = pair.trim().split("=");
    if (k === name) return decodeURIComponent(v || "");
  }
  return null;
}

export interface AuthUser { id: string; level: number }
declare global {
  namespace Express {
    interface Request { user?: AuthUser }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  let token: string | null = null;

  if (auth?.startsWith("Bearer ")) {
    token = auth.slice(7).trim();
  }
  if (!token) {
    token = readCookie(req, "__Host-authix-at") || readCookie(req, "authix-at");
  }

  if (!token || !isLikelyJwt(token)) {
    if (process.env.NODE_ENV !== "production") {
      const segs = token ? token.split(".").length : 0;
      console.warn("[authMiddleware] MALFORMED_TOKEN", { segs, prefix: String(token).slice(0, 12) });
    }
    return res.status(401).json({ error: "MALFORMED_TOKEN" });
  }

  try {
    const payload = verifyAccessToken(token);
    if (!payload?.sub) return res.status(401).json({ error: "INVALID_TOKEN" });
    req.user = { id: String(payload.sub), level: (payload as any).level ?? 0 };
    return next();
  } catch (err: any) {
    if (err?.name === "TokenExpiredError") {
      return res.status(401).json({ error: "TOKEN_EXPIRED" });
    }
    if (process.env.NODE_ENV !== "production") {
      console.error("[authMiddleware] verify failed:", err);
    }
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }
}