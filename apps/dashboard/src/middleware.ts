import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACCESS_COOKIES = ["__Host-authix-at", "authix-at"];

function getAccessToken(req: NextRequest) {
  for (const name of ACCESS_COOKIES) {
    const v = req.cookies.get(name)?.value;
    if (v) return v;
  }
  return "";
}

function parseJwtLevel(token: string): number | null {
  try {
    const seg = token.split(".")[1];
    if (!seg) return null;
    const base = seg.replace(/-/g, "+").replace(/_/g, "/");
    const pad = "=".repeat((4 - (base.length % 4)) % 4);
    const json = typeof atob !== "undefined"
      ? atob(base + pad)
      : Buffer.from(base + pad, "base64").toString("utf8");
    const obj = JSON.parse(json);
    return typeof obj?.level === "number" ? obj.level : null;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const path = url.pathname;

  const at = getAccessToken(req);
  const hasAccess = !!at;
  const level = hasAccess ? parseJwtLevel(at) : null;

  const isAuth = path.startsWith("/auth");
  const isProfile = path.startsWith("/onboarding/profile");
  const isPassword = path.startsWith("/onboarding/password");
  const isProtected =
    path.startsWith("/dashboard") ||
    path.startsWith("/settings") ||
    path.startsWith("/onboarding");

  // Access yoksa, korunan rotalara izin verme
  if (!hasAccess && isProtected) {
    url.pathname = "/auth/email";
    return NextResponse.redirect(url);
  }

  // Auth rotaları → login olmuş kullanıcıyı akışın doğru noktasına taşı
  if (isAuth && hasAccess) {
    if (level === 0) { url.pathname = "/onboarding/profile"; return NextResponse.redirect(url); }
    if (level === 1) { url.pathname = "/onboarding/password"; return NextResponse.redirect(url); }
    url.pathname = "/dashboard"; return NextResponse.redirect(url);
  }

  // Senaryo kuralı:
  // LEVEL 0 → sadece /onboarding/profile
  if (isProfile) {
    if (level === 0) return NextResponse.next();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // LEVEL 1 → sadece /onboarding/password
  if (isPassword) {
    if (level === 1) return NextResponse.next();
    // LEVEL 0 profil'e, LEVEL 2+ dashboard'a
    url.pathname = level === 0 ? "/onboarding/profile" : "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};