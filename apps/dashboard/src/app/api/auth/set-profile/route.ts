import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { cookieNames } from "@/lib/cookies";

export async function POST(req: Request) {
  const jar = await cookies();
  const token = jar.get(cookieNames.access)?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, avatar } = await req.json();

  const r = await fetch("http://localhost:5001/api/v1/auth/set-profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, avatar }),
  });

  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}