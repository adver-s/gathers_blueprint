import type { MyProfile } from "@/lib/api/me";
import { genderLabel } from "@/lib/constants/gender";
import { imageKeyToUrl } from "@/lib/images/imageKeyToUrl";
import { TestProfileImage } from "./TestProfileImage";

function ageFromBirthDate(iso: string): number | null {
  if (!iso || iso.length < 10) return null;
  const y = Number(iso.slice(0, 4));
  const m = Number(iso.slice(5, 7));
  const d = Number(iso.slice(8, 10));
  if (!y || !m || !d) return null;
  const birth = new Date(y, m - 1, d);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const md = today.getMonth() - birth.getMonth();
  if (md < 0 || (md === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

type Props = {
  profile: MyProfile;
  /** 閲覧モード時のみ渡す。画像左上に「編集する」を載せる。 */
  onEditPress?: () => void;
};

export function TestProfileView({ profile, onEditPress }: Props) {
  const imageUrl = imageKeyToUrl(profile.image_key);
  const age = ageFromBirthDate(profile.birth_date);

  const topLeftAction =
    onEditPress != null ? (
      <button
        type="button"
        onClick={onEditPress}
        className="rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm hover:bg-black/70"
      >
        編集する
      </button>
    ) : undefined;

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <TestProfileImage
        displayName={profile.name}
        imageUrl={imageUrl}
        topLeftAction={topLeftAction}
      />

      <h1 className="text-2xl font-bold">{profile.name}</h1>
      {age !== null ? <p>{age}歳</p> : null}
      <p className="text-sm text-neutral-600">{genderLabel(profile.gender)}</p>
      <p className="max-w-md text-center text-neutral-800">
        {profile.bio?.trim() ? profile.bio : "（自己紹介はまだありません）"}
      </p>
    </div>
  );
}
