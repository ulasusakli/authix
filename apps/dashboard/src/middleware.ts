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
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padLen = (4 - (base.length % 4)) % 4;
    const basePadded = base + "=".repeat(padLen);
    const json = typeof atob !== "undefined"
      ? atob(basePadded)
      : Buffer.from(basePadded, "base64").toString("utf-8");
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

  // Korunan rotalara access yoksa → /auth/email
  if (!hasAccess && isProtected) {
    url.pathname = "/auth/email";
    return NextResponse.redirect(url);
  }

  // Auth rotaları → login sonrası yönlendirme
  if (isAuth && hasAccess) {
    if (level === 0) {
      url.pathname = "/onboarding/profile";
    } else if (level === 1) {
      url.pathname = "/onboarding/password";
    } else {
      url.pathname = "/dashboard";
    }
    return NextResponse.redirect(url);
  }

  // Onboarding Profile kuralları
  if (isProfile) {
    if (level === 0) return NextResponse.next(); // sadece LEVEL 0 erişebilir
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Onboarding Password kuralları
  if (isPassword) {
    if (level === 1) return NextResponse.next(); // sadece LEVEL 1 erişebilir
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};