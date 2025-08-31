import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

export function OrdersCard() {
  return (
    <Card className="hover:shadow-md transition">
      <CardHeader>
        <CardTitle>Siparişlerim</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Aboneliklerini ve etkinliklerini görüntüle.
        </p>
        <Link
          href="/dashboard/orders"
          className="text-primary text-sm font-medium hover:underline"
        >
          Siparişlerime Git →
        </Link>
      </CardContent>
    </Card>
  );
}