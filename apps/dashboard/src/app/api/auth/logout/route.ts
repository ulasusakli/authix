import { NextResponse } from "next/server";
import { clearAuthCookies, getRefreshToken } from "@/lib/cookies";

export async function POST() {
  const refreshToken = await getRefreshToken();
  if (refreshToken) {
    await fetch("http://localhost:5001/api/v1/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
  }
  clearAuthCookies();
  return NextResponse.json({ ok: true });
}