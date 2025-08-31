import { cookies } from "next/headers";

const ACCESS_COOKIES = ["__Host-authix-at", "authix-at"];

export function isLikelyJwt(token: any): token is string {
  return (
    typeof token === "string" &&
    /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/.test(token)
  );
}

export async function getAccessTokenFromCookies(): Promise<string | null> {
  const jar = await cookies(); // ✅ Promise olduğu için await
  for (const n of ACCESS_COOKIES) {
    const v = (jar as any).get(n)?.value; // TS’nin Promise/get çelişkisini çözmek için cast
    if (v && v.trim() !== "") {
      if (isLikelyJwt(v)) {
        console.log("[auth.server] Using access token from cookie:", n);
        return v;
      } else {
        console.warn(
          "[auth.server] Ignoring invalid JWT in cookie:",
          n,
          String(v).slice(0, 12)
        );
      }
    }
  }
  return null;
}

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

export async function getLevelFromCookies(): Promise<{ hasAccess: boolean; level: number | null }> {
  const at = await getAccessTokenFromCookies();
  if (!at) return { hasAccess: false, level: null };
  return { hasAccess: true, level: decodeLevelFromJwt(at) };
}