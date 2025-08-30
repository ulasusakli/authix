import { NextResponse } from "next/server";
import { cookieNames } from "@/lib/cookies";

export async function POST() {
  try {
    const refresh = require("next/headers").cookies().get(cookieNames.refresh)?.value;
    if (refresh) {
      await fetch("http://localhost:5001/api/v1/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refresh }),
      }).catch(() => {});
    }
  } catch {}

  const res = NextResponse.json({ ok: true });
  const cookieVariants = [
    cookieNames.access,
    cookieNames.refresh,
    "authix-at",
    "authix-rt",
    "__Host-authix-at",
    "__Host-authix-rt",
  ];

  for (const name of cookieVariants) {
    res.cookies.set(name, "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
      sameSite: "lax",
    });
  }

  return res;
}