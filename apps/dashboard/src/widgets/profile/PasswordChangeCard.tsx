"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function PasswordChangeCard() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleChange() {
    setLoading(true);
    try {
      const r = await fetch("/api/auth/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await r.json();

      if (!r.ok) {
        if (data.error === "INVALID_OLD_PASSWORD") {
          toast.error("Eski şifre yanlış.");
        } else if (data.error === "VALIDATION_ERROR") {
          toast.error("Yeni şifre en az 6 karakter olmalı.");
        } else if (data.error === "UNAUTHORIZED") {
          toast.error("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
        } else {
          toast.error("Şifre değiştirilemedi.");
        }
      } else {
        toast.success("Şifre başarıyla değiştirildi.");
        setOldPassword("");
        setNewPassword("");
      }
    } catch (e) {
      console.error(e);
      toast.error("Beklenmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Şifre Değiştir</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="password"
          placeholder="Eski şifre"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Yeni şifre"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Button onClick={handleChange} disabled={loading}>
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </CardContent>
    </Card>
  );
}