import { NextResponse } from "next/server";
import { cookieNames } from "@/lib/cookies";

const prod = process.env.NODE_ENV === "production";

export async function POST(req: Request) {
  const { email, code } = await req.json();

  const r = await fetch("http://localhost:5001/api/v1/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });

  const data = await r.json();
  if (!r.ok) return NextResponse.json(data, { status: r.status });

  const res = NextResponse.json({ user: data.user });

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