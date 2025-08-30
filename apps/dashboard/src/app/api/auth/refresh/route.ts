import { NextResponse } from "next/server";
import { cookieNames } from "@/lib/cookies";

const prod = process.env.NODE_ENV === "production";

export async function POST() {
  const refreshCookieNameCandidates = [cookieNames.refresh, "authix-rt", "__Host-authix-rt"];
  const cookieHeader = (name: string) => {
    try {
      return require("next/headers").cookies().get(name)?.value;
    } catch {
      return undefined;
    }
  };

  let refreshToken = "";
  for (const name of refreshCookieNameCandidates) {
    const value = cookieHeader(name);
    if (value) {
      refreshToken = value;
      break;
    }
  }

  if (!refreshToken) return NextResponse.json({ error: "NO_REFRESH" }, { status: 401 });

  const r = await fetch("http://localhost:5001/api/v1/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await r.json();
  if (!r.ok) return NextResponse.json(data, { status: r.status });

  const res = NextResponse.json({ ok: true });

  res.cookies.set(cookieNames.access, data.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: prod,
    path: "/",
    maxAge: 15 * 60,
  });

  res.cookies.set(cookieNames.refresh, data.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: prod,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  return res;
}