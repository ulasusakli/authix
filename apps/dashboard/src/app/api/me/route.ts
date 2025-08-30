import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/cookies";

export async function GET() {
  const at = getAccessToken();
  if (!at) return NextResponse.json({ user: null }, { status: 401 });

  const r = await fetch("http://localhost:5001/api/v1/auth/me", {
    headers: { Authorization: `Bearer ${at}` },
  });
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}