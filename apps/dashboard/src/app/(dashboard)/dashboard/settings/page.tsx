import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hesap Ayarları</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Buraya ileride güvenlik ve sistem tercihleri gelecek.</p>
        </CardContent>
      </Card>
    </div>
  );
}