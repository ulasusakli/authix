import { NextRequest, NextResponse } from "next/server";
import { getAccessTokenFromCookies } from "@/lib/auth.server";

export async function PATCH(req: NextRequest) {
  const at = await getAccessTokenFromCookies();
  if (!at) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json();
  const r = await fetch("http://localhost:5001/api/v1/auth/change-password", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${at}`,
    },
    body: JSON.stringify(body),
  });

  const ctype = r.headers.get("content-type") || "";
  if (!ctype.includes("application/json")) {
    const text = await r.text();
    return NextResponse.json(
      { error: "UPSTREAM_NOT_JSON", detail: text.slice(0, 200) },
      { status: r.status }
    );
  }

  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}