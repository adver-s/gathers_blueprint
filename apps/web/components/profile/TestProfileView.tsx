import { Profile } from "@/types/profile";
import { TestProfileImage } from "./TestProfileImage";

type Props = {
  profile: Profile;
};

export function TestProfileView({ profile }: Props) {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <TestProfileImage username={profile.username} />

      <h1 className="text-2xl font-bold">{profile.username}</h1>
      <p>{profile.age}歳</p>
      <p>{profile.gender}</p>
      <p>{profile.bio}</p>
    </div>
  );
}