import { NextRequest, NextResponse } from "next/server";
import { getRefreshTokenFromCookies, clearAuthCookies } from "@/lib/auth.server";

export async function POST(req: NextRequest) {
  const rt = await getRefreshTokenFromCookies();
  if (!rt) {
    clearAuthCookies();
    return NextResponse.json({ ok: true });
  }

  await fetch("http://localhost:5001/api/v1/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: rt }),
  });

  clearAuthCookies();
  return NextResponse.json({ ok: true });
}