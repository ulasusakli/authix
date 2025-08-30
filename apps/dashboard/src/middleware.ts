import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_ROUTES = ["/auth/email", "/auth/otp"];
const PROTECTED = ["/dashboard", "/settings", "/onboarding"];

export function middleware(req: NextRequest) {
  const access = req.cookies.get("__Host-authix-at")?.value;
  const url = req.nextUrl.clone();

  const isAuthRoute = AUTH_ROUTES.some(p => url.pathname.startsWith(p));
  const isProtected = PROTECTED.some(p => url.pathname.startsWith(p));

  if (!access && isProtected) {
    url.pathname = "/auth/email";
    return NextResponse.redirect(url);
  }

  if (access && isAuthRoute) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};