import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export function authGuard(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  const token = h.substring("Bearer ".length);
  try {
    const payload = verifyAccessToken(token);
    (req as any).user = { id: payload.sub, level: payload.level };
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}