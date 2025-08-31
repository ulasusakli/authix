import { UserInfoCard } from "@/widgets/profile/UserInfoCard";

export default function ProfilePage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">Profilim</h1>
      <UserInfoCard />
    </div>
  );
}