import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

export function ProfileCard() {
  return (
    <Card className="hover:shadow-md transition">
      <CardHeader>
        <CardTitle>Profilim</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Bilgilerini güncelle ve hesabını yönet.
        </p>
        <Link
          href="/dashboard/profile"
          className="text-primary text-sm font-medium hover:underline"
        >
          Profilime Git →
        </Link>
      </CardContent>
    </Card>
  );
}