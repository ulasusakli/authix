import { NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/cookies";

export async function POST(req: Request) {
  const { email, code } = await req.json();
  const r = await fetch("http://localhost:5001/api/v1/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  const data = await r.json();
  if (!r.ok) return NextResponse.json(data, { status: r.status });

  setAuthCookies(data.accessToken, data.refreshToken);
  return NextResponse.json({ user: data.user });
}