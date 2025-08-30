import { cookies } from "next/headers";

const prod = process.env.NODE_ENV === "production";
const secure = prod;

export const cookieNames = {
  access: prod ? "__Host-authix-at" : "authix-at",
  refresh: prod ? "__Host-authix-rt" : "authix-rt",
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

export async function getAccessToken() {
  const jar = await cookies();
  return (
    jar.get(cookieNames.access)?.value ||
    jar.get("authix-at")?.value ||
    jar.get("__Host-authix-at")?.value ||
    ""
  );
}

export async function getRefreshToken() {
  const jar = await cookies();
  return (
    jar.get(cookieNames.refresh)?.value ||
    jar.get("authix-rt")?.value ||
    jar.get("__Host-authix-rt")?.value ||
    ""
  );
}