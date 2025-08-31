import { NextResponse } from "next/server";
import { cookieNames } from "@/lib/cookies";

const prod = process.env.NODE_ENV === "production";
const secure = prod;

function readCookie(req: Request, name: string) {
  const header = req.headers.get("cookie") || "";
  for (const pair of header.split(";")) {
    const [k, v] = pair.trim().split("=");
    if (k === name) return decodeURIComponent(v || "");
  }
  return "";
}

export async function POST(req: Request) {
  const at = readCookie(req, cookieNames.access) || readCookie(req, "__Host-authix-at") || readCookie(req, "authix-at");
  if (!at) return NextResponse.json({ error: "NO_ACCESS" }, { status: 401 });

  const { password } = await req.json();
  const r = await fetch("http://localhost:5001/api/v1/auth/set-password", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${at}` },
    body: JSON.stringify({ password }),
  });
  const data = await r.json();
  if (!r.ok) return NextResponse.json(data, { status: r.status });

  // LEVEL1 -> LEVEL2 sonrası yeni tokenlar
  const rt = readCookie(req, cookieNames.refresh) || readCookie(req, "__Host-authix-rt") || readCookie(req, "authix-rt");
  const res = NextResponse.json({ ok: true });

  if (rt) {
    const rr = await fetch("http://localhost:5001/api/v1/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (rr.ok) {
      const rdata = await rr.json();
      res.cookies.set(cookieNames.access, rdata.accessToken, {
        httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 15 * 60,
      });
      res.cookies.set(cookieNames.refresh, rdata.refreshToken, {
        httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 7 * 24 * 60 * 60,
      });
    }
  }

  return res;
}