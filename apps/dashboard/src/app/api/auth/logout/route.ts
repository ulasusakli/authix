import { NextRequest, NextResponse } from "next/server";
import { getRefreshTokenFromCookies, clearAuthCookies } from "@/lib/auth.server";

export async function POST(_req: NextRequest) {
  // Refresh token varsa backend'e bildir
  const rt = await getRefreshTokenFromCookies().catch(() => null);

  if (rt) {
    try {
      await fetch("http://localhost:5001/api/v1/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: rt }),
      });
    } catch {
      // backend kapalıysa sessiz geç
    }
  }

  // ❗ Mutlaka await: cookie’ler response'a set edilsin
  await clearAuthCookies();

  // İstersen JSON dönebilirsin, ama en sağlıklısı redirect:
  return NextResponse.json({ ok: true }, { status: 200 });
  // veya:
  // return NextResponse.redirect(new URL("/auth/email", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
}