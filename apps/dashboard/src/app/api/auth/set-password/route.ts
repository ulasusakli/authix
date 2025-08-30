import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/cookies";

export async function POST(req: Request) {
  const at = getAccessToken();
  if (!at) return NextResponse.json({ error: "NO_ACCESS" }, { status: 401 });

  const body = await req.json();
  const r = await fetch("http://localhost:5001/api/v1/auth/set-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${at}`,
    },
    body: JSON.stringify(body),
  });

  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}