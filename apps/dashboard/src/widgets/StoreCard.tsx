import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

export function StoreCard() {
  return (
    <Card className="hover:shadow-md transition">
      <CardHeader>
        <CardTitle>Vitrinim</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Vitrinini düzenle ve satışlarını yönet.
        </p>
        <Link
          href="/dashboard/store"
          className="text-primary text-sm font-medium hover:underline"
        >
          Vitrinime Git →
        </Link>
      </CardContent>
    </Card>
  );
}