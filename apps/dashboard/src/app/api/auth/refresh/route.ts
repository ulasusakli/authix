import { NextResponse } from "next/server";
import { getRefreshToken, setAuthCookies } from "@/lib/cookies";

export async function POST() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return NextResponse.json({ error: "NO_REFRESH" }, { status: 401 });

  const r = await fetch("http://localhost:5001/api/v1/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  const data = await r.json();
  if (!r.ok) return NextResponse.json(data, { status: r.status });

  setAuthCookies(data.accessToken, data.refreshToken);
  return NextResponse.json({ ok: true });
}