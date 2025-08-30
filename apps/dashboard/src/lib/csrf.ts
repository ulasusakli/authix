"use server";

import { cookies } from "next/headers";
import crypto from "crypto";
import { cookieNames } from "./cookies";

const prod = process.env.NODE_ENV === "production";

export async function ensureCsrf() {
  const jar = await cookies();
  const existing = jar.get(cookieNames.csrf)?.value;
  if (existing) return existing;

  const token = crypto.randomBytes(16).toString("hex");
  jar.set(cookieNames.csrf, token, {
    httpOnly: false, // JS erişebilir
    sameSite: "lax",
    secure: prod,
    path: "/",
    maxAge: 60 * 60,
  });
  return token;
}

export async function readCsrf() {
  return (await cookies()).get(cookieNames.csrf)?.value || "";
}