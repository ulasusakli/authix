import { NextResponse } from "next/server";
import { getAccessTokenFromCookies, isLikelyJwt } from "@/lib/auth.server";

export async function PATCH(req: Request) {
  const at = await getAccessTokenFromCookies();
  if (!at || !isLikelyJwt(at)) {
    return NextResponse.json({ error: "NO_ACCESS" }, { status: 401 });
  }

  const raw = await req.json();
  const body: Record<string, any> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === "string" && v.trim() === "") continue;
    if (v !== undefined && v !== null) body[k] = v;
  }

  const r = await fetch("http://localhost:5001/api/v1/users/me", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${at}`,
    },
    body: JSON.stringify(body),
  });

  const ctype = r.headers.get("content-type") || "";
  if (!ctype.includes("application/json")) {
    const text = await r.text(); // 404 HTML vs. güvenli parse
    return NextResponse.json({ error: "UPSTREAM_NOT_JSON", detail: text.slice(0, 200) }, { status: r.status });
  }

  const data = await r.json();
  if (!r.ok) {
    return NextResponse.json({ ...data, forwarded: true }, { status: r.status });
  }
  return NextResponse.json(data, { status: r.status });
}