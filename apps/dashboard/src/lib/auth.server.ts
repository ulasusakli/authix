import { cookies } from "next/headers";

const ACCESS_COOKIES = ["__Host-authix-at", "authix-at"];

export async function getAccessTokenFromCookies(): Promise<string | null> {
  const jar = await cookies();
  for (const n of ACCESS_COOKIES) {
    const v = jar.get(n)?.value;
    if (v) return v;
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