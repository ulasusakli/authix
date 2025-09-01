import { cookies } from "next/headers";

const ACCESS_COOKIE_KEYS = ["__Host-authix-at", "authix-at"];
const REFRESH_COOKIE_KEYS = ["__Host-authix-rt", "authix-rt"];

/**
 * Basit JWT kontrolü
 */
export function isLikelyJwt(token: any): token is string {
  return (
    typeof token === "string" &&
    /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/.test(token)
  );
}

/**
 * Cookie jar döner
 */
async function getCookieJar() {
  return await cookies();
}

/**
 * Access Token çek
 */
export async function getAccessTokenFromCookies(): Promise<string | null> {
  const jar = await getCookieJar();
  for (const key of ACCESS_COOKIE_KEYS) {
    const v = jar.get(key)?.value;
    if (v && v.trim() !== "") {
      if (isLikelyJwt(v)) {
        console.log("[auth.server] Using access token from cookie:", key);
        return v;
      } else {
        console.warn("[auth.server] Ignoring invalid JWT in cookie:", key);
      }
    }
  }
  return null;
}

/**
 * Refresh Token çek
 */
export async function getRefreshTokenFromCookies(): Promise<string | null> {
  const jar = await getCookieJar();
  for (const key of REFRESH_COOKIE_KEYS) {
    const v = jar.get(key)?.value;
    if (v && v.trim() !== "") {
      if (isLikelyJwt(v)) {
        console.log("[auth.server] Using refresh token from cookie:", key);
        return v;
      } else {
        console.warn("[auth.server] Ignoring invalid JWT in cookie:", key);
      }
    }
  }
  return null;
}

/**
 * Cookie’leri temizle (dev/prod uyumlu)
 */
export async function clearAuthCookies() {
  // Next.js Route Handler context'inde cookies() async kabul ediliyor
  const jar = await cookies();

  // Dev'de HTTP olduğundan secure=false; prod'da true
  const secure = process.env.NODE_ENV === "production";

  const common = {
    path: "/",
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure,
    maxAge: 0,
    expires: new Date(0),
  };

  for (const key of [...ACCESS_COOKIE_KEYS, ...REFRESH_COOKIE_KEYS]) {
    // Boş değer + 0 maxAge + geçmiş tarih ile sil
    jar.set(key, "", common);
  }
}

/**
 * JWT içinden Level decode et
 */
export function decodeLevelFromJwt(token: string): number | null {
  try {
    const seg = token.split(".")[1];
    if (!seg) return null;
    const base = seg.replace(/-/g, "+").replace(/_/g, "/");
    const pad = "=".repeat((4 - (base.length % 4)) % 4);
    const json = Buffer.from(base + pad, "base64").toString("utf8");
    const obj = JSON.parse(json);
    return typeof obj?.level === "number" ? obj.level : null;
  } catch {
    return null;
  }
}

/**
 * Cookie’den Level decode et
 */
export async function getLevelFromCookies(): Promise<{
  hasAccess: boolean;
  level: number | null;
}> {
  const at = await getAccessTokenFromCookies();
  if (!at) return { hasAccess: false, level: null };
  return { hasAccess: true, level: decodeLevelFromJwt(at) };
}