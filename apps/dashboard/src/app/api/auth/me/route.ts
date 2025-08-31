import { NextResponse } from "next/server";
import { getAccessTokenFromCookies, isLikelyJwt } from "@/lib/auth.server";

export async function GET() {
  const at = await getAccessTokenFromCookies(); // <- A W A I T
  if (!at || !isLikelyJwt(at)) {
    console.log("[/api/auth/me] typeof at:", typeof at, "isJwt:", isLikelyJwt(at ?? ""));
    return NextResponse.json({ error: "NO_ACCESS" }, { status: 401 });
  }

  const r = await fetch("http://localhost:5001/api/v1/users/me", {
    headers: { Authorization: `Bearer ${at}` },
  });
  const data = await r.json();
  console.log("[/api/auth/me] typeof at:", typeof at, "isJwt:", isLikelyJwt(at ?? ""));
  return NextResponse.json(data, { status: r.status });
}