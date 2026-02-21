import { TestProfileView } from "@/components/profile/TestProfileView";
import { testProfile } from "@/lib/api/testProfile";

export default function ProfilePage() {
  return <TestProfileView profile={testProfile} />;
}