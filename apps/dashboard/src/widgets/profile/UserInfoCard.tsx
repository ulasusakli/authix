"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function UserInfoCard() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [email, setEmail] = useState("");

  // Fetch user info
  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setName(data.user.name || "");
        setUsername(data.user.username || "");
        setAvatar(data.user.avatar || "");
        setEmail(data.user.email);
      }
    }
    fetchUser();
  }, []);

  async function handleSave() {
    setLoading(true);
    const res = await fetch("/api/auth/update-profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, avatar }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data?.error || "Profil güncellenemedi");
      return;
    }

    toast.success("Profil güncellendi!");
    setUser(data.user);
  }

  if (!user) return <p>Loading...</p>;

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Profil Bilgileri</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">E-posta</label>
          <Input value={email} disabled />
        </div>

        <div>
          <label className="text-sm font-medium">İsim</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <label className="text-sm font-medium">Kullanıcı Adı (slug)</label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>

        <div>
          <label className="text-sm font-medium">Avatar (URL)</label>
          <Input value={avatar} onChange={(e) => setAvatar(e.target.value)} />
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </CardContent>
    </Card>
  );
}