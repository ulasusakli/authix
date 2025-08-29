import jwt, { SignOptions } from "jsonwebtoken";
import env from "../config/env";

type JwtPayload = { sub: string; level: number };

export function signAccessToken(payload: JwtPayload) {
  const options: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRES_IN as any };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

export function signRefreshToken(payload: JwtPayload) {
  const options: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as jwt.JwtPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as jwt.JwtPayload;
}