"use server";

import { cookies } from "next/headers";

const prod = process.env.NODE_ENV === "production";
const secure = prod;

export const cookieNames = {
  access: "__Host-authix-at",
  refresh: "__Host-authix-rt",
  csrf: "authix-csrf",
};

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  accessTTL = 15 * 60,
  refreshTTL = 7 * 24 * 60 * 60
) {
  const jar = await cookies();
  jar.set(cookieNames.access, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: accessTTL,
  });
  jar.set(cookieNames.refresh, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: refreshTTL,
  });
}

export async function clearAuthCookies() {
  const jar = await cookies();
  jar.set(cookieNames.access, "", { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 0 });
  jar.set(cookieNames.refresh, "", { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 0 });
}

export async function getRefreshToken() {
  return (await cookies()).get(cookieNames.refresh)?.value || "";
}

export async function getAccessToken() {
  return (await cookies()).get(cookieNames.access)?.value || "";
}