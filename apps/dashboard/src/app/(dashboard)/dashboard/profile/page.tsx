import {UserInfoCard} from "@/widgets/profile/UserInfoCard";
import PasswordChangeCard from "@/widgets/profile/PasswordChangeCard";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <UserInfoCard />
      <PasswordChangeCard />
    </div>
  );
}