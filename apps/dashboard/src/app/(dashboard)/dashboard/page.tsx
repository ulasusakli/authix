import { StoreCard } from "@/widgets/StoreCard";
import { OrdersCard } from "@/widgets/OrdersCard";
import { ProfileCard } from "@/widgets/ProfileCard";

export default function DashboardHome() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <StoreCard />
      <OrdersCard />
      <ProfileCard />
    </div>
  );
}