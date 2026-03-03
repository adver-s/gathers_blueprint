"use client";

export default function EventImageUploader({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-neutral-100 overflow-hidden">
      <div className="aspect-[16/10] flex items-center justify-center">
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm text-neutral-500">画像をアップロード</span>
        )}
      </div>

      <div className="p-3 text-center">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const url = URL.createObjectURL(file);
              onChange(url);
            }
          }}
        />
      </div>
    </div>
  );
}