"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const AVATARS = ["avatar_1.png","avatar_2.png","avatar_3.png","avatar_4.png","avatar_5.png","avatar_6.png"];

export default function ProfileOnboardingClient() {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !avatar) {
      toast.error("Name and avatar required");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/set-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, avatar }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast.error(data?.error || "Failed to save profile");
      return;
    }
    toast.success("Profile completed!");
    router.replace("/onboarding/password"); // LEVEL1'e geçti, sıradaki adım
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-[420px]">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input placeholder="Your name" value={name} onChange={(e)=>setName(e.target.value)} required />
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Choose an avatar</p>
              <div className="grid grid-cols-3 gap-3">
                {AVATARS.map((a) => (
                  <button
                    type="button"
                    key={a}
                    onClick={() => setAvatar(a)}
                    className={`rounded-xl border-2 p-1 transition ${avatar === a ? "border-blue-600" : "border-transparent"}`}
                  >
                    <img src={`/avatars/${a}`} alt={a} className="rounded-lg" />
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}