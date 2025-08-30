import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();
  const r = await fetch("http://localhost:5001/api/v1/auth/request-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}