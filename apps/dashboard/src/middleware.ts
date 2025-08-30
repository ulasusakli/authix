import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookieNames } from "@/lib/cookies";

// Authentication routes (public, login flow)
const AUTH_ROUTES = ["/auth/email", "/auth/otp"];

// Protected routes (require access token)
const PROTECTED_ROUTES = ["/dashboard", "/settings", "/onboarding"];

function hasAccessCookie(req: NextRequest): boolean {
  // Hem dev hem prod cookie isimlerini kontrol et
  const candidates = [cookieNames.access, "authix-at", "__Host-authix-at"];
  return candidates.some((name) => Boolean(req.cookies.get(name)?.value));
}

export function middleware(req: NextRequest) {
  const accessPresent = hasAccessCookie(req);
  const url = req.nextUrl.clone();

  const isAuthRoute = AUTH_ROUTES.some((route) => url.pathname.startsWith(route));
  const isProtected = PROTECTED_ROUTES.some((route) => url.pathname.startsWith(route));

  // Korumalı route ama access yok → login sayfasına yönlendir
  if (!accessPresent && isProtected) {
    url.pathname = "/auth/email";
    return NextResponse.redirect(url);
  }

  // Access varken tekrar /auth/... sayfalarına gitmeye çalışıyorsa → dashboard’a yönlendir
  if (accessPresent && isAuthRoute) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Middleware her request için çalışır, ancak statik dosyalar hariç
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};