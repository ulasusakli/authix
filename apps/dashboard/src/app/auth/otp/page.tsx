"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { OtpInput } from "@/components/otp-input";

export default function OtpPage() {
  const params = useSearchParams();
  const email = params.get("email") || "";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Enter 6-digit code");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error("Invalid code");
      return;
    }

    // ✅ user.level bilgisine göre yönlendirme
    const level = data?.user?.level ?? 0;
    if (level === 0) {
      toast("Welcome! Let’s complete your profile");
      router.replace("/onboarding/profile");
    } else {
      toast.success("Welcome back!");
      router.replace("/dashboard");
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    const res = await fetch("/api/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      toast.success("OTP resent");
      setCooldown(30);
    } else {
      toast.error("Failed to resend");
    }
  }

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-[380px]">
        <CardHeader>
          <CardTitle>Enter OTP</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <OtpInput length={6} onChange={setCode} />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </form>

          <div className="text-sm text-center mt-3">
            Didn’t get it?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0}
              className="text-blue-600 disabled:text-gray-400"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}