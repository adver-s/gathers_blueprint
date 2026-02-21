import Image from "next/image";

type Props = {
  username: string;
};

export function TestProfileImage({ username }: Props) {
  return (
    <div className="relative w-40 h-40">
      <Image
        src="/images/AdobeStock_455192638_Preview.jpg"
        alt={`${username}のプロフィール画像`}
        fill
        className="object-cover rounded-full"
      />
    </div>
  );
}