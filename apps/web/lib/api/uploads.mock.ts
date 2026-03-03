export async function uploadImageMock(file: File): Promise<{ url: string }> {
  await new Promise((r) => setTimeout(r, 500));

  // 本物のアップロードの代わりに「ブラウザ内で見れるURL」を返す
  const url = URL.createObjectURL(file);
  return { url };
}