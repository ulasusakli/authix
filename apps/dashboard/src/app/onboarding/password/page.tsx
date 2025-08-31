import { redirect } from "next/navigation";
import PasswordOnboardingClient from "./page.client";
import { getLevelFromCookies } from "@/lib/auth.server";

export default async function PasswordOnboardingPage() {
  const { hasAccess, level } = await getLevelFromCookies();
  if (!hasAccess) redirect("/auth/email");

  if (level === 1) return <PasswordOnboardingClient />;     // sadece LEVEL1
  if (level === 0) redirect("/onboarding/profile");         // LEVEL0 buraya gelemez
  redirect("/dashboard");                                   // LEVEL2+ onboarding'e giremez
}