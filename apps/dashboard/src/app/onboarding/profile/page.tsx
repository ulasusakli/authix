import { redirect } from "next/navigation";
import ProfileOnboardingClient from "./page.client";
import { getLevelFromCookies } from "@/lib/auth.server";

export default async function ProfileOnboardingPage() {
  const { hasAccess, level } = await getLevelFromCookies();
  if (!hasAccess) redirect("/auth/email");
  if (level === 0) return <ProfileOnboardingClient />;

  // LEVEL1 → password, LEVEL2+ → dashboard
  if (level === 1) redirect("/onboarding/password");
  redirect("/dashboard");
}