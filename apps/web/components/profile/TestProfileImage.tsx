import Image from "next/image";
import type { ReactNode } from "react";

type Props = {
  displayName: string;
  imageUrl: string | null;
  /** 写真エリア左上に重ねる UI（例: 「編集する」）。クリップされないよう画像とは別レイヤー。 */
  topLeftAction?: ReactNode;
};

const PLACEHOLDER = "/images/AdobeStock_455192638_Preview.jpg";

export function TestProfileImage({ displayName, imageUrl, topLeftAction }: Props) {
  return (
    <div className="relative h-40 w-40 shrink-0">
      <div className="absolute inset-0 overflow-hidden rounded-full bg-neutral-100">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- dynamic URLs from image_key / CDN
          <img
            src={imageUrl}
            alt={`${displayName}のプロフィール画像`}
            className="h-full w-full object-cover"
          />
        ) : (
          <Image
            src={PLACEHOLDER}
            alt={`${displayName}のプロフィール画像`}
            fill
            className="object-cover"
          />
        )}
      </div>
      {topLeftAction ? (
        <div className="pointer-events-auto absolute left-1 top-1 z-10">{topLeftAction}</div>
      ) : null}
    </div>
  );
}
