// `image_key` の意味:
// - `http(s)` で始まる場合: すでに URL なのでそのまま利用
// - それ以外: `NEXT_PUBLIC_IMAGE_BASE_URL` を基底に `${base}/${image_key}` へ組み立て
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? "";

export function imageKeyToUrl(imageKey: string | null | undefined): string | null {
  if (!imageKey) return null;
  if (imageKey.startsWith("http://") || imageKey.startsWith("https://")) return imageKey;
  if (!IMAGE_BASE_URL) return imageKey;
  return `${IMAGE_BASE_URL.replace(/\/$/, "")}/${imageKey.replace(/^\//, "")}`;
}

