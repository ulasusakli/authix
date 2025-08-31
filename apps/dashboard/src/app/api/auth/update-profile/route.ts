import { NextResponse } from "next/server";
import { getAccessTokenFromCookies, isLikelyJwt } from "@/lib/auth.server";

export async function PATCH(req: Request) {
  const at = await getAccessTokenFromCookies(); // <- A W A I T
  if (!at || !isLikelyJwt(at)) {
    return NextResponse.json({ error: "NO_ACCESS" }, { status: 401 });
  }

  const body = await req.json();
  const r = await fetch("http://localhost:5001/api/v1/users/me", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${at}`,
    },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}